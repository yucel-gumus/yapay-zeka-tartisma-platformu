import type { DebateFrame } from "@/types/debate";

export default function DebateFrameView({ frame }: { frame: DebateFrame }) {
  return (
    <section className="mb-6 space-y-3 rounded-2xl border-2 border-[#9BCEC1] bg-white/40 p-5 text-[#2C1A18] break-words">
      <h3 className="font-semibold">Onaylanan tartışma çerçevesi</h3>
      <p className="whitespace-pre-wrap font-semibold leading-relaxed">{frame.thesis}</p>
      {frame.definitions.length > 0 && (
        <dl className="space-y-2 text-sm">
          {frame.definitions.map((d, i) => (
            <div key={i}><dt className="font-semibold">{d.term}</dt><dd className="whitespace-pre-wrap leading-relaxed">{d.meaning}</dd></div>
          ))}
        </dl>
      )}
      <div>
        <p className="mb-2 text-sm font-semibold">Ayrı değerlendirilecek alt iddialar</p>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          {frame.claims.map((claim, i) => <li key={i} className="whitespace-pre-wrap">{claim}</li>)}
        </ol>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed"><strong>Kapsam: </strong>{frame.scope}</p>
    </section>
  );
}
