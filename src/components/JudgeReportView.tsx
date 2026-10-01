import type { JudgeReport } from "@/types/debate";
import { DECISION_LABELS } from "@/lib/debateProtocol";
export default function JudgeReportView({ report }: { report: JudgeReport }) {
  return (
    <div className="space-y-6 text-[#2C1A18]">
      {report.decision && (
        <section className="report-decision">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="eyebrow">NİHAİ HAKEM HÜKMÜ</h3>
            <span className="pill bg-[#9BCEC1]/60">
              {DECISION_LABELS[report.decision.outcome]}
            </span>
          </div>
          <p className="mt-4 text-lg sm:text-xl font-semibold leading-relaxed whitespace-pre-wrap break-words">
            {report.decision.ruling}
          </p>
          <p className="mt-4 text-xs font-semibold">
            Argüman üstünlüğü:{" "}
            {report.decision.winner || "Belirgin üstünlük yok"}
          </p>
          <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap break-words">
            {report.decision.rationale}
          </p>
        </section>
      )}
      <section>
        <h3 className="section-title mb-3">Gerekçeli değerlendirme</h3>
        <p className="text-sm whitespace-pre-wrap leading-relaxed break-words">
          {report.summary}
        </p>
      </section>
      <section>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="section-title">Argümanların gücü</h3>
          <span className="helper">Her ölçüt 0–10</span>
        </div>
        <div className="grid gap-3">
          {report.scores.map((s, i) => (
            <article key={i} className="score-card">
              <h4 className="text-sm font-semibold">{s.name}</h4>
              <dl className="score-grid">
                {[
                  ["Tutarlılık", s.consistency],
                  ["Kanıt", s.evidence],
                  ["Karşı argümana cevap", s.rebuttal],
                  ["Belirsizliği kabul", s.uncertainty],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>
                      {value}
                      <span className="text-xs font-normal opacity-60">
                        {" "}
                        /10
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="text-xs leading-relaxed break-words">
                {s.reasoning}
              </p>
            </article>
          ))}
        </div>
      </section>
      {(
        [
          ["Ortaklaşılan noktalar", report.agreements],
          ["Çözülemeyen anlaşmazlıklar", report.disagreements],
          ["Doğrulanması gereken iddialar", report.claimsToVerify],
        ] as const
      ).map(([title, items]) => (
        <section key={title} className="border-t border-[#5E3D38]/15 pt-4">
          <h3 className="text-sm font-semibold mb-3">{title}</h3>
          {items.length ? (
            <ul className="list-disc space-y-2 pl-4 text-xs leading-relaxed break-words">
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
