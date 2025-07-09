import { Mission } from "../models/game";

interface MissionResultProps {
  mission: Mission;
}

export function MissionResultComponent({ mission }: MissionResultProps) {
  if (mission.state === "PENDING") {
    return null;
  }

  const isSuccess = mission.state === "SUCCESS";

  return (
    <div style={{
      border: "1px solid #ddd",
      padding: "0.5rem",
      marginBottom: "0.5rem"
    }}>
      <h4>Mission Result</h4>
      <p>Result: {mission.state}</p>
      {mission.numFails !== undefined && (
        <p>Number of Fails: {mission.numFails}</p>
      )}
      {mission.team && mission.team.length > 0 && (
        <p>Team: {mission.team.join(", ")}</p>
      )}
    </div>
  );
}