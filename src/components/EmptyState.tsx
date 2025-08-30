type Props = {
  title: string;
  subtitle?: string;
};

export function EmptyState({ title, subtitle }: Props) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto mb-4 max-w-2xl">
        <img
          src="/pikachu-sad.gif"
          alt="Sad Pikachu"
          className="mx-auto rounded-lg shadow max-h-72 object-contain"
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement;
            if (!el.src.endsWith("/injured-pokemon.png")) {
              el.src = "/injured-pokemon.png";
            }
          }}
        />
      </div>
      <p className="text-slate-600">{title}</p>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
}
