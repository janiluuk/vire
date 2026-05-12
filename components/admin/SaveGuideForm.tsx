import { saveGuide } from "@/app/admin/guides/actions";
import fiMessages from "@/messages/fi.json";

const a = fiMessages.admin;

export type SaveGuideFormDefaults = {
  editorSlug: string | null;
  slug?: string;
  titleFi?: string;
  titleEn?: string;
  descFi?: string;
  descEn?: string;
  category?: string;
  difficulty?: string;
  minutesFi?: number;
  videoUrl?: string;
  order?: number;
  published?: boolean;
  mdxContent?: string;
};

export function SaveGuideForm({ defaults }: { defaults: SaveGuideFormDefaults }) {
  const isEdit = Boolean(defaults.editorSlug);

  return (
    <form action={saveGuide} className="vire-card space-y-8 p-6 sm:p-8">
      <input type="hidden" name="editorSlug" value={defaults.editorSlug ?? ""} />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="g-slug" className="mb-2 block font-semibold text-ink">
            {a.guideFieldSlug}
          </label>
          <input
            id="g-slug"
            name="slug"
            required
            readOnly={isEdit}
            defaultValue={defaults.slug ?? ""}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            className="min-h-tap w-full rounded-lg border border-em bg-card px-4 font-mono text-lg read-only:bg-sunken"
          />
        </div>
        <div>
          <label htmlFor="g-titleFi" className="mb-2 block font-semibold">
            {a.guideFieldTitleFi}
          </label>
          <input
            id="g-titleFi"
            name="titleFi"
            required
            defaultValue={defaults.titleFi ?? ""}
            className="min-h-tap w-full rounded-lg border border-em px-4 text-lg"
          />
        </div>
        <div>
          <label htmlFor="g-titleEn" className="mb-2 block font-semibold">
            {a.guideFieldTitleEn}
          </label>
          <input
            id="g-titleEn"
            name="titleEn"
            defaultValue={defaults.titleEn ?? ""}
            className="min-h-tap w-full rounded-lg border border-em px-4 text-lg"
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="g-descFi" className="mb-2 block font-semibold">
            {a.guideFieldDescFi}
          </label>
          <textarea
            id="g-descFi"
            name="descFi"
            required
            rows={3}
            defaultValue={defaults.descFi ?? ""}
            className="w-full rounded-lg border border-em px-4 py-3 text-lg"
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="g-descEn" className="mb-2 block font-semibold">
            {a.guideFieldDescEn}
          </label>
          <textarea
            id="g-descEn"
            name="descEn"
            rows={3}
            defaultValue={defaults.descEn ?? ""}
            className="w-full rounded-lg border border-em px-4 py-3 text-lg"
          />
        </div>
        <div>
          <label htmlFor="g-cat" className="mb-2 block font-semibold">
            {a.guideFieldCategory}
          </label>
          <input
            id="g-cat"
            name="category"
            defaultValue={defaults.category ?? "install"}
            className="min-h-tap w-full rounded-lg border border-em px-4 text-lg"
          />
        </div>
        <div>
          <label htmlFor="g-diff" className="mb-2 block font-semibold">
            {a.guideFieldDifficulty}
          </label>
          <select
            id="g-diff"
            name="difficulty"
            defaultValue={defaults.difficulty ?? "easy"}
            className="min-h-tap w-full rounded-lg border border-em px-4 text-lg"
          >
            <option value="easy">easy</option>
            <option value="medium">medium</option>
            <option value="hard">hard</option>
          </select>
        </div>
        <div>
          <label htmlFor="g-min" className="mb-2 block font-semibold">
            {a.guideFieldMinutes}
          </label>
          <input
            id="g-min"
            name="minutesFi"
            type="number"
            min={1}
            defaultValue={defaults.minutesFi ?? 5}
            className="min-h-tap w-full rounded-lg border border-em px-4 text-lg"
          />
        </div>
        <div>
          <label htmlFor="g-order" className="mb-2 block font-semibold">
            {a.guideFieldOrder}
          </label>
          <input
            id="g-order"
            name="order"
            type="number"
            defaultValue={defaults.order ?? 0}
            className="min-h-tap w-full rounded-lg border border-em px-4 text-lg"
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="g-video" className="mb-2 block font-semibold">
            {a.guideFieldVideo}
          </label>
          <input
            id="g-video"
            name="videoUrl"
            type="text"
            inputMode="url"
            placeholder="https://"
            defaultValue={defaults.videoUrl ?? ""}
            className="min-h-tap w-full rounded-lg border border-em px-4 text-lg"
          />
        </div>
        <div>
          <label htmlFor="g-pub" className="mb-2 block font-semibold">
            {a.guideFieldPublished}
          </label>
          <select
            id="g-pub"
            name="published"
            defaultValue={defaults.published ? "true" : "false"}
            className="min-h-tap w-full rounded-lg border border-em px-4 text-lg"
          >
            <option value="false">{a.guidePublishedNo}</option>
            <option value="true">{a.guidePublishedYes}</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="g-mdx" className="mb-2 block font-semibold">
          {a.guideFieldMdx}
        </label>
        <textarea
          id="g-mdx"
          name="mdxBody"
          rows={18}
          defaultValue={defaults.mdxContent ?? ""}
          className="w-full rounded-lg border border-em bg-canvas px-4 py-3 font-mono text-base leading-relaxed text-ink"
          spellCheck={false}
        />
      </div>
      <button
        type="submit"
        className="min-h-tap rounded-xl bg-vire-green px-8 py-3 font-semibold text-canvas hover:opacity-[0.85]"
      >
        {a.guideSave}
      </button>
      <p className="text-sm text-fog">{a.guideSaveHint}</p>
    </form>
  );
}
