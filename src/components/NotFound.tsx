export function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-xl text-center">
        <div className="mt-6">
          <img
            src="/injured-pokemon.png"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "https://archives.bulbagarden.net/media/upload/thumb/2/29/Ash_Pok%C3%A9mon_injured.png/800px-Ash_Pok%C3%A9mon_injured.png";
            }}
            alt="Injured Pokémon"
            className="mx-auto rounded-lg shadow max-h-72 object-contain"
          />
        </div>
        <h1 className="text-6xl font-extrabold text-slate-800">404</h1>
        <p className="mt-2 text-lg text-slate-600">Page not found</p>
        <p className="mt-1 text-sm text-slate-500">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>

        <div className="mt-6">
          <a href="/" className="btn inline-flex">
            Go back home
          </a>
        </div>
      </div>
    </div>
  );
}
