import { useState, useRef, useEffect, useCallback } from "react";
import {
  ChatMessageType,
  Branch,
  SharedDebateData,
  DebateRole,
  JudgeReport,
  DebateFrame,
} from "@/types/debate";
import { DEBATE_CONFIG } from "@/config/constants";
import { ROLE_ORDER, parseJudgeReport } from "@/lib/debateProtocol";
import { getTurnContext, restoreDebateRounds, type DebateRounds } from "@/lib/debateSchedule";
import { createManualFrame, parseDebateFrame } from "@/lib/debateFrame";
import {
  parseBranches,
  parseChatHistory,
  parseStringList,
} from "@/lib/debateState";
export type { ChatMessageType };
const DRAFT_KEY = "debate-draft-v1";
export const useDebateLogic = () => {
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [activeBranchOrder, setActiveBranchOrder] = useState<string[]>([]);
  const [branchRoles, setBranchRoles] = useState<Record<string, DebateRole>>(
    {},
  );
  const [topic, setTopicState] = useState("");
  const [debateFrame, setDebateFrame] = useState<DebateFrame | null>(null);
  const [isClarifying, setIsClarifying] = useState(false);
  const [sources, setSources] = useState("");
  const [roundsPerExpert, setRoundsPerExpert] = useState<DebateRounds>(4);
  const [chatHistory, setChatHistory] = useState<ChatMessageType[]>([]);
  const [isDebating, setIsDebating] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [finalVerdict, setFinalVerdict] = useState("");
  const [judgeReport, setJudgeReport] = useState<JudgeReport | null>(null);
  const [isStreamingMessage, setIsStreamingMessage] = useState(false);
  const [currentStreamingContent, setCurrentStreamingContent] = useState("");
  const [showJudgePopup, setShowJudgePopup] = useState(false);
  const [isJudgeLoading, setIsJudgeLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const runRef = useRef(0);
  const historyRef = useRef<ChatMessageType[]>([]);
  const turnRef = useRef(0);
  const draftBranchesRef = useRef<Branch[]>([]);
  const clarifyControllerRef = useRef<AbortController | null>(null);
  const clarifyRunRef = useRef(0);
  const commitHistory = (history: ChatMessageType[]) => {
    historyRef.current = history;
    setChatHistory(history);
  };
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        const history = parseChatHistory(d?.chatHistory);
        const selected = parseStringList(d?.selectedBranches);
        if (typeof d.topic === "string" && history && selected) {
          setTopicState(d.topic);
          setDebateFrame(parseDebateFrame(d.debateFrame, true));
          setSources(typeof d.sources === "string" ? d.sources : "");
          setSelectedBranches(selected);
          const order = parseStringList(d.activeBranchOrder);
          setActiveBranchOrder(
            order?.length && order.every((id) => selected.includes(id))
              ? order
              : selected,
          );
          const roles: Record<string, DebateRole> = {};
          for (const id of selected) {
            const role = d.branchRoles?.[id];
            roles[id] = ROLE_ORDER.includes(role) ? role : "assumptions";
          }
          setBranchRoles(roles);
          setRoundsPerExpert(restoreDebateRounds(d.roundsPerExpert, selected.length, history.length > 0));
          commitHistory(history);
          const turn = history.filter((m) => m.role === "assistant").length;
          turnRef.current = turn;
          setCurrentTurn(turn);
          setFinalVerdict(
            typeof d.finalVerdict === "string" ? d.finalVerdict : "",
          );
          setJudgeReport(parseJudgeReport(d.judgeReport));
          draftBranchesRef.current = parseBranches(d.branchDetails) ?? [];
        }
      }
    } catch {
      setError("Kayıtlı oturum okunamadı. Yeni tartışma başlatabilirsiniz.");
    }
    setReady(true);
    const runState = runRef;
    const abortState = abortControllerRef;
    const clarifyState = clarifyControllerRef;
    const clarifyRunState = clarifyRunRef;
    return () => {
      runState.current++;
      abortState.current?.abort();
      clarifyRunState.current++;
      clarifyState.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          topic,
          debateFrame,
          sources,
          roundsPerExpert,
          selectedBranches,
          activeBranchOrder,
          branchRoles,
          chatHistory,
          finalVerdict,
          judgeReport,
          branchDetails: draftBranchesRef.current,
        }),
      );
    } catch {
      setError(
        "Otomatik kayıt yapılamadı. Tarayıcı depolama alanını kontrol edin.",
      );
    }
  }, [
    ready,
    topic,
    debateFrame,
    sources,
    roundsPerExpert,
    selectedBranches,
    activeBranchOrder,
    branchRoles,
    chatHistory,
    finalVerdict,
    judgeReport,
  ]);
  const handleBranchSelection = (id: string) => {
    if (selectedBranches.includes(id))
      setSelectedBranches(selectedBranches.filter((x) => x !== id));
    else if (selectedBranches.length < DEBATE_CONFIG.MAX_EXPERTS) {
      setSelectedBranches([...selectedBranches, id]);
      setBranchRoles((prev) => {
        const taken = selectedBranches.map((x) => prev[x]);
        const free = prev[id] && !taken.includes(prev[id]);
        return {
          ...prev,
          [id]: free
            ? prev[id]
            : ROLE_ORDER.find((role) => !taken.includes(role)) ?? "assumptions",
        };
      });
    }
  };
  const removeBranch = (id: string) =>
    setSelectedBranches((prev) => prev.filter((x) => x !== id));
  const cancelClarification = () => {
    clarifyRunRef.current++;
    clarifyControllerRef.current?.abort();
    setIsClarifying(false);
  };
  const setTopic = (value: string) => {
    if (value === topic) return;
    cancelClarification();
    setTopicState(value);
    setDebateFrame(null);
    setError("");
  };
  const clarifyTopic = async () => {
    if (!topic.trim() || topic.length > 2000 || chatHistory.length > 0) return;
    cancelClarification();
    const run = clarifyRunRef.current;
    const controller = new AbortController();
    clarifyControllerRef.current = controller;
    setIsClarifying(true);
    setError("");
    try {
      const response = await fetch("/api/clarify-topic", {
        method: "POST", headers: { "Content-Type": "application/json" },
        signal: controller.signal, body: JSON.stringify({ topic }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Çerçeve önerisi alınamadı. Yeniden deneyin veya kendiniz düzenleyin.");
      const frame = parseDebateFrame(data.frame);
      if (!frame) throw new Error("Çerçeve önerisi eksik. Yeniden deneyin veya kendiniz düzenleyin.");
      if (clarifyRunRef.current === run && !controller.signal.aborted) setDebateFrame(frame);
    } catch (e) {
      if (clarifyRunRef.current === run && !controller.signal.aborted)
        setError(e instanceof Error ? e.message : "Çerçeve oluşturulamadı.");
    } finally {
      if (clarifyRunRef.current === run) setIsClarifying(false);
    }
  };
  const editFrameManually = () => {
    cancelClarification();
    setDebateFrame(createManualFrame(topic));
    setError("");
  };
  const pauseDebate = () => {
    runRef.current++;
    abortControllerRef.current?.abort();
    setIsDebating(false);
    setIsStreamingMessage(false);
    setCurrentStreamingContent("");
  };
  const runDebate = async (
    allBranches: Branch[],
    order: string[],
    initial: ChatMessageType[],
    start: number,
  ) => {
    if (order.length < DEBATE_CONFIG.MIN_EXPERTS) {
      setError("Devam etmek için en az iki geçerli uzman gerekli.");
      return;
    }
    const run = ++runRef.current;
    const controller = new AbortController();
    abortControllerRef.current?.abort();
    abortControllerRef.current = controller;
    setIsDebating(true);
    setError("");
    let history = initial;
    try {
      for (let turn = start; turn < roundsPerExpert * order.length; turn++) {
        if (runRef.current !== run) return;
        const expert =
          allBranches.find((b) => b.id === order[turn % order.length]) ||
          draftBranchesRef.current.find(
            (b) => b.id === order[turn % order.length],
          );
        if (!expert)
          throw new Error(
            "Seçilen uzman bulunamadı. Yeni tartışma için uzmanları yeniden seçin.",
          );
        setIsStreamingMessage(true);
        setCurrentStreamingContent("");
        const turnContext = getTurnContext(turn, order.length, roundsPerExpert);
        let content = "";
        for (let attempt = 0; attempt <= DEBATE_CONFIG.MAX_RETRIES; attempt++) {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              chatHistory: history,
              personaDescription: expert,
              topic,
              debateFrame,
              sources,
              debateRole: branchRoles[expert.id] || "assumptions",
              ...turnContext,
              participatingExperts: order.map((id) =>
                (allBranches.find((b) => b.id === id) || draftBranchesRef.current.find((b) => b.id === id))?.name,
              ).filter(Boolean),
            }),
          });
          if (!response.ok) {
            const body = await response.json().catch(() => null);
            if (
              [429, 502, 503, 504].includes(response.status) &&
              attempt < DEBATE_CONFIG.MAX_RETRIES
            ) {
              const delay = Math.min(
                Number(response.headers.get("Retry-After")) ||
                  3 * (attempt + 1),
                60,
              );
              setError(
                `Yanıt gecikti. ${delay} saniye sonra yeniden denenecek (${attempt + 1}/${DEBATE_CONFIG.MAX_RETRIES}).`,
              );
              await new Promise<void>((resolve, reject) => {
                const onAbort = () => {
                  clearTimeout(timer);
                  reject(new DOMException("Aborted", "AbortError"));
                };
                const timer = setTimeout(() => {
                  controller.signal.removeEventListener("abort", onAbort);
                  resolve();
                }, delay * 1000);
                controller.signal.addEventListener("abort", onAbort, {
                  once: true,
                });
              });
              continue;
            }
            throw new Error(
              body?.error ||
                "Yanıt alınamadı. Tartışmayı kaldığı yerden sürdürebilirsiniz.",
            );
          }
          const reader = response.body?.getReader();
          if (!reader) throw new Error("Yanıt okunamadı.");
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            content += decoder.decode(value, { stream: true });
            if (runRef.current === run) setCurrentStreamingContent(content);
          }
          content += decoder.decode();
          break;
        }
        if (runRef.current !== run) return;
        content = content.trim();
        if (content.length < 10)
          throw new Error(
            "Uzman boş veya eksik yanıt verdi. Yeniden deneyebilirsiniz.",
          );
        history = [
          ...history,
          {
            role: "assistant",
            content,
            branch: expert.id,
            branchName: expert.name,
            debateRole: branchRoles[expert.id] || "assumptions",
            roundNumber: turnContext.roundNumber,
            stage: turnContext.stage,
          },
        ];
        commitHistory(history);
        turnRef.current = turn + 1;
        setCurrentTurn(turn + 1);
        setError("");
        setIsStreamingMessage(false);
        setCurrentStreamingContent("");
      }
    } catch (e) {
      if (runRef.current === run && !controller.signal.aborted)
        setError(e instanceof Error ? e.message : "Tartışma duraklatıldı.");
    } finally {
      if (runRef.current === run) {
        setIsDebating(false);
        setIsStreamingMessage(false);
        setCurrentStreamingContent("");
      }
    }
  };
  const startDebate = (allBranches: Branch[]) => {
    if (isDebating || isJudgeLoading || isClarifying) return;
    if (!parseDebateFrame(debateFrame)) {
      setError("Önce tartışma çerçevesini oluşturup tez ve alt iddiaları tamamlayın.");
      return;
    }
    const order = selectedBranches.filter((id) =>
      allBranches.some((b) => b.id === id),
    );
    if (order.length < DEBATE_CONFIG.MIN_EXPERTS || !topic.trim() || !ready)
      return;
    draftBranchesRef.current = allBranches.filter((b) => order.includes(b.id));
    setActiveBranchOrder(order);
    setFinalVerdict("");
    setJudgeReport(null);
    setCurrentTurn(0);
    turnRef.current = 0;
    const initial: ChatMessageType[] = [
      { role: "user", content: `Tartışma konusu: ${topic}` },
    ];
    commitHistory(initial);
    void runDebate(allBranches, order, initial, 0);
  };
  const resumeDebate = (allBranches: Branch[]) => {
    if (!isDebating && !isJudgeLoading)
      void runDebate(
        allBranches,
        activeBranchOrder,
        historyRef.current.filter((m) => m.role !== "judge"),
        turnRef.current,
      );
  };
  const stopDebate = async () => {
    if (
      isJudgeLoading ||
      !historyRef.current.some((m) => m.role === "assistant")
    )
      return;
    pauseDebate();
    const run = runRef.current;
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setShowJudgePopup(true);
    setIsJudgeLoading(true);
    setError("");
    try {
      const response = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          topic,
          debateFrame,
          sources,
          chatHistory: historyRef.current.filter((m) => m.role !== "judge"),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          data.error ||
            "Hakem değerlendirmesi alınamadı. Yeniden deneyebilirsiniz.",
        );
      if (runRef.current !== run) return;
      setFinalVerdict(data.verdict);
      setJudgeReport(data.report || null);
      commitHistory([
        ...historyRef.current.filter((m) => m.role !== "judge"),
        { role: "judge", content: data.verdict },
      ]);
    } catch (e) {
      if (runRef.current === run && !controller.signal.aborted) {
        setError(e instanceof Error ? e.message : "Hakem yanıtı alınamadı.");
        setShowJudgePopup(false);
      }
    } finally {
      if (runRef.current === run) setIsJudgeLoading(false);
    }
  };
  const resetDebate = () => {
    cancelClarification();
    pauseDebate();
    setSelectedBranches([]);
    setActiveBranchOrder([]);
    setBranchRoles({});
    setTopicState("");
    setDebateFrame(null);
    setSources("");
    setRoundsPerExpert(4);
    commitHistory([]);
    setCurrentTurn(0);
    turnRef.current = 0;
    setFinalVerdict("");
    setJudgeReport(null);
    setError("");
    setShowJudgePopup(false);
    setIsJudgeLoading(false);
    setShowShareModal(false);
    draftBranchesRef.current = [];
  };
  const generateShareData = useCallback(
    (allBranches: Branch[]): SharedDebateData => ({
      topic,
      debateFrame,
      sources,
      roundsPerExpert,
      chatHistory,
      selectedBranches,
      branchRoles,
      judgeReport,
      branchDetails: selectedBranches
        .map(
          (id) =>
            allBranches.find((b) => b.id === id) ||
            draftBranchesRef.current.find((b) => b.id === id),
        )
        .filter((b): b is Branch => !!b),
      finalVerdict,
      timestamp: Date.now(),
    }),
    [
      topic,
      debateFrame,
      sources,
      roundsPerExpert,
      chatHistory,
      selectedBranches,
      branchRoles,
      judgeReport,
      finalVerdict,
    ],
  );
  return {
    selectedBranches,
    activeBranchOrder,
    branchRoles,
    setBranchRoles,
    topic,
    setTopic,
    debateFrame,
    setDebateFrame,
    isClarifying,
    clarifyTopic,
    editFrameManually,
    sources,
    setSources,
    roundsPerExpert,
    setRoundsPerExpert,
    totalTurns: roundsPerExpert * (activeBranchOrder.length || selectedBranches.length),
    chatHistory,
    isDebating,
    currentTurn,
    finalVerdict,
    judgeReport,
    isStreamingMessage,
    currentStreamingContent,
    showJudgePopup,
    isJudgeLoading,
    showShareModal,
    error,
    ready,
    handleBranchSelection,
    removeBranch,
    startDebate,
    resumeDebate,
    pauseDebate,
    stopDebate,
    resetDebate,
    openJudgePopup: () => setShowJudgePopup(true),
    closeJudgePopup: () => setShowJudgePopup(false),
    openShareModal: () => setShowShareModal(true),
    closeShareModal: () => setShowShareModal(false),
    generateShareData,
  };
};
