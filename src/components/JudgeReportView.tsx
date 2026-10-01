import type { JudgeReport } from "@/types/debate";
import { DECISION_LABELS } from "@/lib/debateProtocol";
export default function JudgeReportView({ report }: { report: JudgeReport }) {
  return (
    <div className="space-y-5 text-[#2C1A18]">
      {report.decision && (
        <section className="rounded-xl border-2 border-[#5E8C7F] bg-[#9BCEC1]/25 p-4 sm:p-5">
          <h3 className="font-semibold">Nihai hakem hükmü</h3>
          <p className="mt-2 text-sm font-semibold text-[#36594F]">
            {DECISION_LABELS[report.decision.outcome]}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-lg font-semibold leading-relaxed break-words">
            {report.decision.ruling}
          </p>
          <p className="mt-3 text-sm font-semibold break-words">
            Argüman üstünlüğü: {report.decision.winner || "Belirgin üstünlük yok"}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed break-words">
            {report.decision.rationale}
          </p>
        </section>
      )}
      <p className="whitespace-pre-wrap leading-relaxed">{report.summary}</p>
      <p className="text-xs text-[#5E3D38] sm:hidden">
        Tüm ölçütleri görmek için tabloyu yatay kaydırın.
      </p>
      <div className="overflow-x-auto rounded-xl border border-[#9BCEC1]">
        <table className="w-full min-w-[620px] text-left text-sm">
          <caption className="p-3 text-left font-semibold">
            Argüman değerlendirmesi · Her ölçüt 0–10
          </caption>
          <thead className="bg-[#9BCEC1]/30">
            <tr>
              {[
                "Uzman",
                "Tutarlılık",
                "Kanıt",
                "Karşı argümana cevap",
                "Belirsizliği kabul",
              ].map((h) => (
                <th key={h} scope="col" className="p-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {report.scores.map((s, i) => (
              <tr key={i} className="border-t border-[#9BCEC1]/40">
                <th scope="row" className="p-3">
                  {s.name}
                </th>
                {[s.consistency, s.evidence, s.rebuttal, s.uncertainty].map(
                  (n, j) => (
                    <td key={j} className="p-3">
                      {n}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {report.scores.map((s, i) => (
        <p key={i} className="text-sm leading-relaxed">
          <strong>{s.name}: </strong>
          {s.reasoning}
        </p>
      ))}
      {(
        [
          ["Ortaklaşılan noktalar", report.agreements],
          ["Çözülemeyen anlaşmazlıklar", report.disagreements],
          ["Doğrulanması gereken iddialar", report.claimsToVerify],
        ] as const
      ).map(([title, items]) => (
        <section
          key={title}
          className="rounded-xl border border-[#FFB6A6]/60 bg-white/40 p-4"
        >
          <h3 className="mb-2 font-semibold">{title}</h3>
          {items.length ? (
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
              {items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm">Hakem bu bölüm için bir madde belirtmedi.</p>
          )}
        </section>
      ))}
      <p className="text-xs text-[#5E3D38]">
        Bu puanlar AI değerlendirmesidir. İddialar ve kaynaklar bağımsız
        doğrulanmamıştır.
      </p>
    </div>
  );
}
