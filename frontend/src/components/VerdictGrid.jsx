import MasterVerdict from './MasterVerdict';

export default function VerdictGrid({ verdicts, lang = 'zh' }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {verdicts.map((v, i) => (
        <MasterVerdict key={i} verdict={v} lang={lang} />
      ))}
    </div>
  );
}
