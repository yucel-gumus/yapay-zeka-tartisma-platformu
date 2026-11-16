import type { JudgeReport } from "@/types/debate";
import { DECISION_LABELS } from "@/lib/debateProtocol";
import {
  getOutcomeStyle,
  getPersonaTheme,
  getScoreTierStyle,
} from "@/lib/personaTheme";

export default function JudgeReportView({ report }: { report: JudgeReport }) {
  const outcomeStyle = report.decision
    ? getOutcomeStyle(report.decision.outcome)
    : null;

  return (
    <div className="space-y-6 text-[#253341]">
      {report.decision && outcomeStyle && (
        <section className="report-decision">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="eyebrow">NİHAİ HAKEM HÜKMÜ</h3>
            <span
              className="pill"
              style={{
                backgroundColor: outcomeStyle.bg,
                color: outcomeStyle.text,
                borderColor: outcomeStyle.border,
              }}
            >
              {DECISION_LABELS[report.decision.outcome]}
            </span>
          </div>
          <p className="mt-4 text-lg sm:text-xl font-semibold leading-relaxed whitespace-pre-wrap break-words text-[#253341]">
            {report.decision.ruling}
          </p>
          <p className="mt-4 text-xs font-semibold text-[#3E5164]">
            Argüman üstünlüğü:{" "}
            <span className="text-[#253341]">
              {report.decision.winner || "Belirgin üstünlük yok"}
            </span>
          </p>
          <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap break-words text-[#253341]">
            {report.decision.rationale}
          </p>
        </section>
      )}
      <section>
        <h3 className="section-title mb-3">Gerekçeli değerlendirme</h3>
        <p className="text-sm whitespace-pre-wrap leading-relaxed break-words text-[#253341]">
          {report.summary}
        </p>
      </section>
      <section>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="section-title">Argümanların gücü</h3>
          <span className="helper">Her ölçüt 0–10</span>
        </div>
        <div className="grid gap-3">
          {report.scores.map((s, i) => {
            const persona = getPersonaTheme(s.name);
            const avg =
              (s.consistency + s.evidence + s.rebuttal + s.uncertainty) / 4;
            const avgStyle = getScoreTierStyle(avg);
            return (
              <article
                key={i}
                className="score-card"
                style={{ borderLeft: `4px solid ${persona.border}` }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold"
                      style={{
                        backgroundColor: persona.bg,
                        color: persona.text,
                        borderColor: persona.border,
                      }}
                    >
                      {s.name.slice(0, 1)}
                    </span>
                    <h4 className="text-sm font-semibold text-[#253341]">
                      {s.name}
                    </h4>
                  </div>
                  <span
                    className="inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-bold tabular-nums"
                    style={{
                      backgroundColor: avgStyle.badgeBg,
                      color: avgStyle.badgeText,
                      borderColor: avgStyle.border,
                    }}
                  >
                    Ort. {avg.toFixed(1)}/10
                  </span>
                </div>
                <dl className="score-grid">
                  {(
                    [
                      ["Tutarlılık", s.consistency],
                      ["Kanıt", s.evidence],
                      ["Karşı argümana cevap", s.rebuttal],
                      ["Belirsizliği kabul", s.uncertainty],
                    ] as const
                  ).map(([label, value]) => {
                    const tier = getScoreTierStyle(value);
                    const pct = Math.max(0, Math.min(100, (value / 10) * 100));
                    return (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>
                          {value}
                          <span className="text-xs font-normal text-[#3E5164]">
                            {" "}
                            /10
                          </span>
                        </dd>
                        <span
                          aria-hidden
                          className="mt-2 block h-1.5 w-full overflow-hidden rounded-full bg-[#DCE3EA]"
                        >
                          <span
                            className="block h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: tier.bar,
                            }}
                          />
                        </span>
                      </div>
                    );
                  })}
                </dl>
                <p className="text-xs leading-relaxed break-words text-[#3E5164]">
                  {s.reasoning}
                </p>
              </article>
            );
          })}
        </div>
      </section>
      {(
        [
          ["Ortaklaşılan noktalar", report.agreements, "#3E5164", "#DBE6DD"],
          ["Çözülemeyen anlaşmazlıklar", report.disagreements, "#EC7D55", "rgba(242, 164, 136, 0.2)"],
          ["Doğrulanması gereken iddialar", report.claimsToVerify, "#AB421C", "#DCE3EA"],
        ] as const
      ).map(([title, items, accentBorder, cardTint]) => (
        <section
          key={title}
          className="rounded-xl border border-[#BCC7D2] p-4"
          style={{
            backgroundColor: cardTint,
            borderLeft: `4px solid ${accentBorder}`,
          }}
        >
          <h3 className="text-sm font-semibold mb-3 text-[#253341]">{title}</h3>
          {items.length ? (
            <ul className="list-disc space-y-2 pl-4 text-xs leading-relaxed break-words text-[#253341]">
              {items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="helper">Hakem bu bölüm için bir madde belirtmedi.</p>
          )}
        </section>
      ))}
      <p className="helper">
        Bu puanlar AI değerlendirmesidir. İddialar ve kaynaklar bağımsız
        doğrulanmamıştır.
      </p>
    </div>
  );
}
