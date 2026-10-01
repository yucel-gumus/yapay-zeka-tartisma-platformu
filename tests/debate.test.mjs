import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { createRequire } from "node:module";
const nativeRequire = createRequire(import.meta.url);
const cache = new Map();
function load(path) {
  if (cache.has(path)) return cache.get(path);
  const source = readFileSync(
    new URL(`../${path}.ts`, import.meta.url),
    "utf8",
  );
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const module = { exports: {} };
  cache.set(path, module.exports);
  new Function("require", "module", "exports", code)(
    (name) =>
      name.startsWith("@/")
        ? load(`src/${name.slice(2)}`)
        : nativeRequire(name),
    module,
    module.exports,
  );
  return module.exports;
}
const protocol = load("src/lib/debateProtocol");
const schedule = load("src/lib/debateSchedule");
const frameProtocol = load("src/lib/debateFrame");
process.env.AI_API_URL = "http://mock-gateway";
process.env.GATEWAY_CLIENT_API_KEY = "test";
const frame = {
  thesis: "Dünya doğal süreçlerle oluşmuştur ve bir yaratıcı yoktur.",
  definitions: [{ term: "Kendiliğinden", meaning: "Doğal süreçlerle oluşma; mutlak yokluktan türeme anlamı yüklenmiyor." }],
  claims: ["Dünya doğal süreçlerle oluşmuştur.", "Bir yaratıcı yoktur."],
  scope: "İki iddia ayrı değerlendirilir; ilk iddia ikinciyi otomatik olarak kanıtlamaz.",
};
const guard = load("src/lib/apiGuard");
const report = {
  decision: {
    outcome: "not_established",
    ruling: "Bu oturumda tez kanıtlanamadı.",
    winner: null,
    rationale: "Deneysel veri sunulmadı. Tek konuşmacı olduğu için üstünlük karşılaştırılamıyor.",
  },
  summary: "Kanıt sınırlı.",
  scores: [
    {
      name: "Fizikçi",
      consistency: 8,
      evidence: 2,
      rebuttal: 6,
      uncertainty: 9,
      reasoning: "Kaynak verilmedi.",
    },
  ],
  agreements: ["Veri gerekli."],
  disagreements: ["Sonuç belirsiz."],
  claimsToVerify: ["Deney sonucunu kontrol et."],
};
function request(body, ip = crypto.randomUUID()) {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}
test("structured reports accept JSON and fenced JSON while preserving legacy fallback", () => {
  assert.deepEqual(protocol.parseJudgeReport(JSON.stringify(report)), report);
  assert.deepEqual(
    protocol.parseJudgeReport("  ```json\n" + JSON.stringify(report) + "\n```"),
    report,
  );
  assert.equal(protocol.parseJudgeReport("Eski hakem kararı"), null);
});
test("reports reject invalid scores and missing sections", () => {
  assert.equal(
    protocol.parseJudgeReport({
      ...report,
      scores: [{ ...report.scores[0], evidence: 11 }],
    }),
    null,
  );
  assert.equal(
    protocol.parseJudgeReport({ ...report, agreements: [null] }),
    null,
  );
  assert.equal(protocol.parseJudgeReport({ summary: "eksik" }), null);
});
test("text export preserves all report sections", () => {
  const text = protocol.formatJudgeReport(report);
  for (const expected of [
    "Nihai hakem hükmü · Tez kanıtlanamadı",
    report.decision.ruling,
    report.decision.rationale,
    "Kanıt 2/10",
    "Kaynak verilmedi.",
    "Veri gerekli.",
    "Sonuç belirsiz.",
    "Deney sonucunu kontrol et.",
  ])
    assert.ok(text.includes(expected));
});
test("saved reports without rulings remain readable but new judge responses require a ruling", async () => {
  const { decision, ...legacy } = report;
  assert.deepEqual(protocol.parseJudgeReport(legacy), legacy);
  const original = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ report: legacy });
  try {
    const res = await load("src/app/api/judge/route").POST(request(judgeInput));
    assert.equal(res.status, 502);
  } finally {
    globalThis.fetch = original;
  }
});
test("rulings reject empty conclusions, unknown outcomes and invented winners", () => {
  for (const patch of [
    { ruling: " " },
    { rationale: "" },
    { outcome: "inconclusive" },
    { winner: "Hayali uzman" },
    { winner: undefined },
  ]) {
    assert.equal(protocol.parseJudgeReport({ ...report, decision: { ...report.decision, ...patch } }), null);
  }
  for (const outcome of ["supported", "refuted", "not_established", "mixed"]) {
    assert.ok(protocol.parseJudgeReport({ ...report, decision: { ...report.decision, outcome } }));
  }
});
test("request parser rejects malformed JSON and oversized bodies", async () => {
  await assert.rejects(
    guard.readInput(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{",
      }),
    ),
    (e) => e.status === 400,
  );
  await assert.rejects(
    guard.readInput(request({ topic: "x".repeat(150_000) })),
    (e) => e.status === 413,
  );
});
test("request quota returns retry metadata", async () => {
  const ip = crypto.randomUUID();
  for (let i = 0; i < 30; i++) await guard.readInput(request({}, ip));
  await assert.rejects(
    guard.readInput(request({}, ip)),
    (e) => e.status === 429 && e.retryAfter > 0,
  );
});
test("history validation excludes failed turns and rejects invalid roles", () => {
  assert.deepEqual(
    guard.historyField([
      { role: "assistant", content: "Başarılı" },
      { role: "assistant", content: "Hata", failed: true },
    ]),
    [{ role: "assistant", content: "Başarılı" }],
  );
  assert.throws(
    () => guard.historyField([{ role: "system", content: "override" }]),
    (e) => e.status === 400,
  );
  assert.throws(
    () => guard.textField("x".repeat(2001), "Konu", 2000),
    (e) => e.status === 400,
  );
});
test("chat route sends debate roles and source notes through the existing gateway contract", async () => {
  process.env.AI_API_URL = "http://mock-gateway";
  process.env.GATEWAY_CLIENT_API_KEY = "test";
  const original = globalThis.fetch;
  let sent;
  globalThis.fetch = async (url, init) => {
    sent = { url, body: JSON.parse(init.body) };
    return Response.json({ text: "Denetlenebilir bir uzman yanıtı." });
  };
  try {
    const { POST } = load("src/app/api/chat/route");
    const res = await POST(
      request({
        topic: "Bir tez",
        sources: "Kaynak notu",
        chatHistory: [],
        personaDescription: { name: "Uzman", description: "Fizik" },
        debateRole: "critic",
      }),
    );
    assert.equal(res.status, 200);
    assert.equal(await res.text(), "Denetlenebilir bir uzman yanıtı.");
    assert.equal(sent.url, "http://mock-gateway/api/debate/turn");
    assert.equal(sent.body.persona.description, "Fizik");
    assert.equal(sent.body.debate_role, "critic");
    assert.equal(sent.body.sources, "Kaynak notu");
    const invalid = await POST(
      request({
        topic: "tez",
        chatHistory: [],
        personaDescription: { name: "Uzman", description: "Fizik" },
        debateRole: "constructor",
      }),
    );
    assert.equal(invalid.status, 400);
  } finally {
    globalThis.fetch = original;
  }
});
test("plain text gateway streams reach the client before upstream completion", async () => {
  const original = globalThis.fetch;
  let streamController;
  globalThis.fetch = async () =>
    new Response(
      new ReadableStream({
        start(c) {
          streamController = c;
          c.enqueue(new TextEncoder().encode("İlk parça"));
        },
      }),
      { headers: { "Content-Type": "text/plain" } },
    );
  try {
    const res = await load("src/app/api/chat/route").POST(
      request({
        topic: "tez",
        chatHistory: [],
        personaDescription: { name: "Uzman", description: "Fizik" },
        debateRole: "evidence",
      }),
    );
    const reader = res.body.getReader();
    assert.equal(
      new TextDecoder().decode((await reader.read()).value),
      "İlk parça",
    );
    streamController.enqueue(new TextEncoder().encode(" ve devamı"));
    streamController.close();
    assert.equal(
      new TextDecoder().decode((await reader.read()).value),
      " ve devamı",
    );
  } finally {
    globalThis.fetch = original;
  }
});
const judgeInput = {
  topic: "Kuantum bilgisayarların geleceği",
  chatHistory: [
    { role: "assistant", content: "Bir argüman", branchName: "Fizikçi" },
  ],
};
test("judge route uses the Python debate endpoint and forwards source notes", async () => {
  const original = globalThis.fetch;
  let sent;
  globalThis.fetch = async (url, init) => {
    sent = { url, body: JSON.parse(init.body) };
    return Response.json({ verdict: "Metin", report });
  };
  try {
    const res = await load("src/app/api/judge/route").POST(
      request({ ...judgeInput, sources: "Kaynak notu" }),
    );
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.deepEqual(data.report, report);
    assert.ok(data.verdict.includes("Kanıt 2/10"));
    assert.equal(sent.url, "http://mock-gateway/api/debate/judge");
    assert.equal(sent.body.sources, "Kaynak notu");
    assert.equal(sent.body.topic, judgeInput.topic);
    assert.equal(sent.body.chat_history[0].branch_name, "Fizikçi");
  } finally {
    globalThis.fetch = original;
  }
});
test("legacy backend output is rejected with an actionable compatibility error", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return Response.json({ verdict: "KAZANAN: MATEMATİKÇİ" });
  };
  try {
    const res = await load("src/app/api/judge/route").POST(request(judgeInput));
    const data = await res.json();
    assert.equal(res.status, 502);
    assert.equal(calls, 1);
    assert.equal(data.verdict, undefined);
    assert.ok(data.error.includes("Python backend"));
    assert.ok(data.error.includes("tartışmanız korundu"));
  } finally {
    globalThis.fetch = original;
  }
});
test("backend generation failures cannot become successful verdicts", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () =>
    Response.json({ detail: "generation failed" }, { status: 502 });
  try {
    const res = await load("src/app/api/judge/route").POST(request(judgeInput));
    assert.equal(res.status, 502);
    assert.equal((await res.json()).report, undefined);
  } finally {
    globalThis.fetch = original;
  }
});
test("judge rejects invented speakers and incomplete participant scoring", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () =>
    Response.json({
      report: {
        ...report,
        scores: [{ ...report.scores[0], name: "Tartışmada olmayan uzman" }],
      },
    });
  try {
    assert.equal(
      (await load("src/app/api/judge/route").POST(request(judgeInput))).status,
      502,
    );
    globalThis.fetch = async () => Response.json({ report });
    const input = {
      ...judgeInput,
      chatHistory: [
        ...judgeInput.chatHistory,
        {
          role: "assistant",
          content: "Karşı argüman",
          branchName: "Matematikçi",
        },
      ],
    };
    assert.equal(
      (await load("src/app/api/judge/route").POST(request(input))).status,
      502,
    );
  } finally {
    globalThis.fetch = original;
  }
});
test("cross-origin browser requests are rejected", async () => {
  const req = new Request("http://localhost/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://another-site.example",
    },
    body: "{}",
  });
  await assert.rejects(guard.readInput(req), (e) => e.status === 403);
});
test("same-origin browser requests honor the actual host when Next.js normalizes the URL", async () => {
  const req = new Request("http://localhost:3000/api/clarify-topic", {
    method: "POST", body: JSON.stringify({ topic: "Tez" }),
    headers: { "Content-Type": "application/json", Host: "127.0.0.1:3000", Origin: "http://127.0.0.1:3000", "x-forwarded-for": crypto.randomUUID() },
  });
  assert.deepEqual(await guard.readInput(req), { topic: "Tez" });
});
function loadWithMocks(path, mocks) {
  const source = readFileSync(
    new URL(`../${path}.ts`, import.meta.url),
    "utf8",
  );
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const module = { exports: {} };
  new Function("require", "module", "exports", code)(
    (name) => mocks[name] || nativeRequire(name),
    module,
    module.exports,
  );
  return module.exports;
}
const sharedData = {
  topic: "Test",
  chatHistory: [],
  selectedBranches: [],
  branchDetails: [],
  finalVerdict: "Sonuç",
  timestamp: 1,
};
test("share retries reuse the supplied document ID and surface write errors", async () => {
  const writes = [];
  let fail = false;
  const share = loadWithMocks("src/utils/shareUtils", {
    "@/lib/firebase": { db: {} },
    "@/lib/debateProtocol": protocol,
    "@/lib/debateSchedule": schedule,
    "@/lib/debateFrame": frameProtocol,
    "firebase/firestore": {
      doc: (_, collection, id) => ({ collection, id }),
      setDoc: async (ref, data) => {
        if (fail) throw new Error("offline");
        writes.push({ ref, data });
      },
    },
  });
  assert.equal(
    await share.saveDebateToFirebase(sharedData, "fixed-session"),
    "fixed-session",
  );
  assert.equal(
    await share.saveDebateToFirebase(sharedData, "fixed-session"),
    "fixed-session",
  );
  assert.deepEqual(
    writes.map((w) => w.ref.id),
    ["fixed-session", "fixed-session"],
  );
  fail = true;
  await assert.rejects(
    share.generateShareableLink(sharedData, "fixed-session"),
    /Paylaşım bağlantısı oluşturulamadı/,
  );
});
test("shared debate loader supports legacy IDs and propagates connection errors", async () => {
  let offline = false;
  const share = loadWithMocks("src/utils/shareUtils", {
    "@/lib/firebase": { db: {} },
    "@/lib/debateProtocol": protocol,
    "@/lib/debateSchedule": schedule,
    "@/lib/debateFrame": frameProtocol,
    "firebase/firestore": {
      doc: () => ({}),
      collection: () => ({}),
      where: () => ({}),
      query: () => ({}),
      getDoc: async () => {
        if (offline) throw new Error("offline");
        return { exists: () => false };
      },
      getDocs: async () => ({
        empty: false,
        docs: [{ data: () => sharedData }],
      }),
    },
  });
  const loaded = await share.loadDebateFromFirebase("legacy-id");
  assert.equal(loaded.topic, "Test");
  assert.equal(loaded.judgeReport, null);
  offline = true;
  await assert.rejects(
    share.loadDebateFromFirebase("legacy-id"),
    /Tartışma yüklenemedi/,
  );
});

test("all debate lengths give each participant a full opening and closing round", () => {
  for (const rounds of [3, 4, 6]) {
    for (const experts of [2, 3, 4]) {
      const turns = Array.from({ length: rounds * experts }, (_, turn) => schedule.getTurnContext(turn, experts, rounds));
      assert.equal(turns.filter((c) => c.stage === "opening").length, experts);
      assert.equal(turns.filter((c) => c.stage === "closing").length, experts);
      for (let round = 1; round <= rounds; round++)
        assert.equal(turns.filter((c) => c.roundNumber === round).length, experts);
      assert.equal(turns.at(-1).roundNumber, rounds);
      assert.equal(turns.at(-1).stage, "closing");
    }
  }
  assert.deepEqual([1, 2, 3, 4].map((r) => schedule.getDebateStage(r, 4)), ["opening", "rebuttal", "cross_examination", "closing"]);
  assert.deepEqual([1, 2, 3, 4, 5, 6].map((r) => schedule.getDebateStage(r, 6)), ["opening", "rebuttal", "cross_examination", "evidence", "response", "closing"]);
});

test("legacy drafts retain their 12-turn budget and new drafts default to four rounds", () => {
  for (const experts of [2, 3, 4]) {
    assert.equal(schedule.restoreDebateRounds(undefined, experts, true) * experts, 12);
    assert.equal(schedule.restoreDebateRounds(undefined, experts, false), 4);
  }
  assert.equal(schedule.restoreDebateRounds(6, 4, true), 6);
});

test("chat route validates and forwards the round plan and full participant list", async () => {
  const original = globalThis.fetch;
  let body;
  let calls = 0;
  globalThis.fetch = async (_, init) => {
    calls++;
    body = JSON.parse(init.body);
    return Response.json({ text: "Somut bir kapanış görüşü." });
  };
  const input = { topic: "Tez", sources: "", chatHistory: [], personaDescription: { name: "Fizikçi", description: "Fizik" }, debateRole: "critic", roundNumber: 4, totalRounds: 4, participatingExperts: ["Fizikçi", "Matematikçi"] };
  try {
    const route = load("src/app/api/chat/route");
    assert.equal((await route.POST(request(input))).status, 200);
    assert.equal(body.round_number, 4);
    assert.equal(body.total_rounds, 4);
    assert.deepEqual(body.participating_experts, input.participatingExperts);
    for (const patch of [{ roundNumber: 5 }, { totalRounds: 5 }, { roundNumber: 1.5 }, { totalRounds: undefined }, { participatingExperts: ["Başka uzman"] }])
      assert.equal((await route.POST(request({ ...input, ...patch }))).status, 400);
    assert.equal(calls, 1);
  } finally { globalThis.fetch = original; }
});

function hookHarness() {
  const slots = [];
  let cursor = 0;
  let pending = [];
  const react = {
    useState(initial) {
      const i = cursor++;
      if (!(i in slots)) slots[i] = initial;
      return [slots[i], (value) => { slots[i] = typeof value === "function" ? value(slots[i]) : value; }];
    },
    useRef(initial) {
      const i = cursor++;
      if (!(i in slots)) slots[i] = { current: initial };
      return slots[i];
    },
    useEffect(effect, deps) {
      const i = cursor++;
      if (!slots[i] || deps.some((d, j) => !Object.is(d, slots[i][j]))) {
        slots[i] = deps;
        pending.push(effect);
      }
    },
    useCallback(fn) { return fn; },
  };
  const hook = loadWithMocks("src/hooks/useDebateLogic", {
    react,
    "@/config/constants": load("src/config/constants"),
    "@/lib/debateProtocol": protocol,
    "@/lib/debateSchedule": schedule,
    "@/lib/debateFrame": frameProtocol,
  }).useDebateLogic;
  return {
    render() {
      cursor = 0;
      const result = hook();
      const effects = pending;
      pending = [];
      effects.forEach((f) => f());
      return result;
    },
  };
}
async function until(predicate) {
  for (let i = 0; i < 100; i++) {
    if (predicate()) return;
    await new Promise((resolve) => setImmediate(resolve));
  }
  assert.fail("Debate did not reach the expected state");
}

test("pausing and restoring a deep debate resumes the unfinished turn and ends after 24 speeches", async () => {
  const previousFetch = globalThis.fetch;
  const previousStorage = globalThis.localStorage;
  const saved = new Map();
  globalThis.localStorage = { getItem: (key) => saved.get(key) || null, setItem: (key, value) => saved.set(key, value) };
  const experts = ["a", "b", "c", "d"].map((id) => ({ id, name: id, description: "Alan" }));
  const requests = [];
  let block = true;
  globalThis.fetch = async (_, init) => {
    requests.push(JSON.parse(init.body));
    if (block && requests.length === 4) {
      await new Promise((_, reject) => init.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true }));
    }
    return new Response("Denetlenebilir bir uzman argümanı.");
  };
  try {
    const first = hookHarness();
    first.render();
    let state = first.render();
    state.setTopic("Bir tez");
    state.setDebateFrame(frame);
    state.setRoundsPerExpert(6);
    for (const expert of experts) { state = first.render(); state.handleBranchSelection(expert.id); }
    state = first.render();
    state.startDebate(experts);
    await until(() => requests.length === 4);
    state = first.render();
    assert.equal(state.currentTurn, 3);
    state.pauseDebate();
    first.render();
    assert.equal(JSON.parse(saved.get("debate-draft-v1")).roundsPerExpert, 6);
    block = false;
    const restored = hookHarness();
    restored.render();
    state = restored.render();
    assert.equal(state.isDebating, false);
    assert.equal(state.totalTurns, 24);
    assert.deepEqual(state.debateFrame, frame);
    assert.equal(state.currentTurn, 3);
    state.resumeDebate(experts);
    await until(() => restored.render().currentTurn === 24);
    state = restored.render();
    assert.equal(state.chatHistory.filter((m) => m.role === "assistant").length, 24);
    assert.equal(state.isDebating, false);
    assert.equal(requests[4].personaDescription.id, "d");
    assert.equal(requests[4].stage, "opening");
    for (const request of requests) assert.deepEqual(request.debateFrame, frame);
    for (const expert of experts) assert.equal(state.chatHistory.filter((m) => m.branch === expert.id).length, 6);
    assert.ok(state.chatHistory.slice(-4).every((m) => m.stage === "closing" && m.roundNumber === 6));
    const share = state.generateShareData(experts);
    assert.equal(share.roundsPerExpert, 6);
    assert.deepEqual(share.debateFrame, frame);
    assert.equal(share.chatHistory.at(-1).stage, "closing");
    state.resetDebate();
    state = restored.render();
    assert.equal(state.roundsPerExpert, 4);
    assert.equal(state.chatHistory.length, 0);
  } finally {
    globalThis.fetch = previousFetch;
    globalThis.localStorage = previousStorage;
  }
});

test("frame validation rejects empty claims and oversized fields but preserves incomplete editing drafts", () => {
  assert.deepEqual(frameProtocol.parseDebateFrame(frame), frame);
  for (const patch of [
    { thesis: " " }, { claims: [] }, { claims: [" "] },
    { definitions: [{ term: "Kavram", meaning: "" }] },
    { thesis: "x".repeat(2001) }, { claims: Array(7).fill("İddia") },
  ]) assert.equal(frameProtocol.parseDebateFrame({ ...frame, ...patch }), null);
  const incomplete = { ...frame, thesis: "", definitions: [{ term: "", meaning: "" }] };
  assert.deepEqual(frameProtocol.parseDebateFrame(incomplete, true), incomplete);
  assert.equal(frameProtocol.parseDebateFrame(incomplete), null);
});

test("clarification route uses the backend schema and rejects invalid provider frames", async () => {
  const original = globalThis.fetch;
  let sent;
  globalThis.fetch = async (url, init) => {
    sent = { url, body: JSON.parse(init.body) };
    return Response.json({ frame });
  };
  try {
    const route = load("src/app/api/clarify-topic/route");
    const res = await route.POST(request({ topic: "Dünya kendiliğinden oluşmuştur, bir yaratıcı yoktur." }));
    assert.equal(res.status, 200);
    assert.deepEqual((await res.json()).frame, frame);
    assert.equal(sent.url, "http://mock-gateway/api/debate/clarify");
    assert.ok(sent.body.topic.includes("kendiliğinden"));
    globalThis.fetch = async () => Response.json({ frame: { ...frame, claims: [] } });
    assert.equal((await route.POST(request({ topic: "Tez" }))).status, 502);
  } finally { globalThis.fetch = original; }
});

test("the same edited frame reaches both expert and judge routes and invalid frames stop before generation", async () => {
  const original = globalThis.fetch;
  const sent = [];
  globalThis.fetch = async (url, init) => {
    sent.push({ url, body: JSON.parse(init.body) });
    return url.endsWith("/judge") ? Response.json({ report }) : Response.json({ text: "Bir uzman argümanı." });
  };
  try {
    assert.equal((await load("src/app/api/chat/route").POST(request({
      ...judgeInput, debateFrame: frame, personaDescription: { name: "Fizikçi", description: "Alan" }, debateRole: "critic",
    }))).status, 200);
    assert.equal((await load("src/app/api/judge/route").POST(request({ ...judgeInput, debateFrame: frame }))).status, 200);
    for (const item of sent) assert.deepEqual(item.body.debate_frame, frame);
    assert.equal((await load("src/app/api/judge/route").POST(request({ ...judgeInput, debateFrame: { ...frame, thesis: "" } }))).status, 400);
    assert.equal(sent.length, 2);
  } finally { globalThis.fetch = original; }
});

test("clarification never starts a debate and a topic edit discards a late AI suggestion", async () => {
  const previousFetch = globalThis.fetch;
  const previousStorage = globalThis.localStorage;
  const saved = new Map();
  globalThis.localStorage = { getItem: (key) => saved.get(key) || null, setItem: (key, value) => saved.set(key, value) };
  let finish;
  const requests = [];
  globalThis.fetch = async (url) => {
    requests.push(url);
    return await new Promise((resolve) => { finish = resolve; });
  };
  try {
    const harness = hookHarness();
    harness.render();
    let state = harness.render();
    state.setTopic("İlk konu");
    state = harness.render();
    const pending = state.clarifyTopic();
    state = harness.render();
    assert.equal(state.isClarifying, true);
    assert.equal(state.chatHistory.length, 0);
    state.setTopic("Yeni konu");
    finish(Response.json({ frame }));
    await pending;
    state = harness.render();
    assert.equal(state.topic, "Yeni konu");
    assert.equal(state.debateFrame, null);
    assert.equal(state.isClarifying, false);
    assert.deepEqual(requests, ["/api/clarify-topic"]);
    state.editFrameManually();
    state = harness.render();
    assert.equal(state.debateFrame.thesis, "Yeni konu");
    assert.equal(state.chatHistory.length, 0);
    state.setDebateFrame({ ...frame, thesis: "" });
    harness.render();
    const restored = hookHarness();
    restored.render();
    assert.equal(restored.render().debateFrame.thesis, "");
  } finally { globalThis.fetch = previousFetch; globalThis.localStorage = previousStorage; }
});

test("new debates require a reviewed frame before any expert call", () => {
  const previousStorage = globalThis.localStorage;
  globalThis.localStorage = { getItem: () => null, setItem: () => {} };
  try {
    const harness = hookHarness();
    harness.render();
    let state = harness.render();
    state.setTopic("Bir konu");
    state = harness.render();
    state.startDebate([{ id: "a", name: "Fizikçi", description: "Alan" }, { id: "b", name: "Matematikçi", description: "Alan" }]);
    state = harness.render();
    assert.equal(state.isDebating, false);
    assert.equal(state.chatHistory.length, 0);
    assert.ok(state.error.includes("çerçevesini"));
  } finally { globalThis.localStorage = previousStorage; }
});
