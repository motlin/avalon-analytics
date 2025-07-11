import { RequestInfo } from "rwsdk/worker";
import { getFirestoreRestService } from "../../services/firestore-rest";
import { Game } from "../../models/game";

export async function GamesList({ ctx }: RequestInfo) {
  let games: Game[] = [];
  let error: string | null = null;

  try {
    const firestoreRestService = getFirestoreRestService();
    games = await firestoreRestService.getGameLogs(20);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load games";
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Games List</h1>
      {games.length === 0 ? (
        <p>No games found</p>
      ) : (
        <ul>
          {games.map((game) => {
            const winner = game.outcome?.winner || "In Progress";
            const playerCount = Object.keys(game.players).length;
            const date = game.timeCreated.toLocaleDateString();
            const time = game.timeCreated.toLocaleTimeString();
            
            return (
              <li key={game.id}>
                <a href={`/game/${game.id}`}>
                  {date} {time} - {playerCount} players - {winner}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}