import { Mission } from "../models/game";
import { ReactNode } from "react";

interface MissionProps {
  mission: Mission;
  missionNumber: number;
  children?: ReactNode;
}

export function MissionComponent({ mission, missionNumber, children }: MissionProps) {
  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
      <h3>Mission {missionNumber}</h3>
      <p>Team Size: {mission.teamSize}</p>
      <p>Fails Required: {mission.failsRequired}</p>
      {children}
    </div>
  );
}