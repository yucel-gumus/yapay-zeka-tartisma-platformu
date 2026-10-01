import type { DebateFrame } from "@/types/debate";

interface Props {
  frame: DebateFrame;
  onChange: (frame: DebateFrame) => void;
  disabled: boolean;
}

const inputClass = "field";

export default function DebateFrameEditor({
  frame,
  onChange,
  disabled,
}: Props) {
  return (
    <fieldset disabled={disabled} className="mt-4 space-y-4">
      <legend className="mb-2 text-sm font-semibold">
        Öneriyi gözden geçir ve düzenle
      </legend>
      <div className="space-y-2">
        <label htmlFor="frame-thesis" className="block text-sm font-semibold">
          Tartışılacak tez veya soru
        </label>
        <textarea
          id="frame-thesis"
          rows={3}
          maxLength={2000}
          value={frame.thesis}
          onChange={(e) => onChange({ ...frame, thesis: e.target.value })}
          className={inputClass}
        />
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold">
          Kavramların bu oturumdaki anlamı
        </p>
        {frame.definitions.map((definition, index) => (
          <div key={index} className="space-y-2 rounded-xl bg-[#9BCEC1]/10 p-4">
            <label
              htmlFor={`frame-term-${index}`}
              className="block text-xs font-semibold"
            >
              Kavram {index + 1}
            </label>
            <input
              id={`frame-term-${index}`}
              maxLength={150}
              value={definition.term}
              className={inputClass}
              onChange={(e) =>
                onChange({
                  ...frame,
                  definitions: frame.definitions.map((d, i) =>
                    i === index ? { ...d, term: e.target.value } : d,
                  ),
                })
              }
            />
            <label
              htmlFor={`frame-meaning-${index}`}
              className="block text-xs font-semibold"
            >
              Bu kavramla ne kastediliyor?
            </label>
            <textarea
              id={`frame-meaning-${index}`}
              rows={2}
              maxLength={1000}
              value={definition.meaning}
              className={inputClass}
              onChange={(e) =>
                onChange({
                  ...frame,
                  definitions: frame.definitions.map((d, i) =>
                    i === index ? { ...d, meaning: e.target.value } : d,
                  ),
                })
              }
            />
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...frame,
                  definitions: frame.definitions.filter((_, i) => i !== index),
                })
              }
              className="text-xs font-semibold underline"
            >
              Kavramı kaldır
            </button>
          </div>
        ))}
        {frame.definitions.length < 6 && (
          <button
            type="button"
            onClick={() =>
              onChange({
                ...frame,
                definitions: [...frame.definitions, { term: "", meaning: "" }],
              })
            }
            className="text-sm font-semibold underline"
          >
            Kavram ekle
          </button>
        )}
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold">
          Ayrı değerlendirilecek alt iddialar
        </p>
        {frame.claims.map((claim, index) => (
          <div key={index} className="space-y-2">
            <label
              htmlFor={`frame-claim-${index}`}
              className="block text-xs font-semibold"
            >
              Alt iddia veya soru {index + 1}
            </label>
            <textarea
              id={`frame-claim-${index}`}
              rows={2}
              maxLength={1000}
              value={claim}
              className={inputClass}
              onChange={(e) =>
                onChange({
                  ...frame,
                  claims: frame.claims.map((c, i) =>
                    i === index ? e.target.value : c,
                  ),
                })
              }
            />
            {frame.claims.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...frame,
                    claims: frame.claims.filter((_, i) => i !== index),
                  })
                }
                className="text-xs font-semibold underline"
              >
                Alt iddiayı kaldır
              </button>
            )}
          </div>
        ))}
        {frame.claims.length < 6 && (
          <button
            type="button"
            onClick={() =>
              onChange({ ...frame, claims: [...frame.claims, ""] })
            }
            className="text-sm font-semibold underline"
          >
            Alt iddia ekle
          </button>
        )}
      </div>
      <div className="space-y-2">
        <label htmlFor="frame-scope" className="block text-sm font-semibold">
          Tartışmanın kapsamı
        </label>
        <textarea
          id="frame-scope"
          rows={3}
          maxLength={2000}
          value={frame.scope}
          onChange={(e) => onChange({ ...frame, scope: e.target.value })}
          className={inputClass}
        />
      </div>
      <p className="text-xs text-[#5E3D38]">
        Uzmanlar ve hakem onayladığın bu çerçeveyi kullanacak. Bir tanım,
        iddianın doğruluğuna ilişkin kanıt değildir.
      </p>
    </fieldset>
  );
}
