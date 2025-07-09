interface ProposalVoteProps {
  playerName: string;
  vote: boolean;
}

export function ProposalVoteComponent({ playerName, vote }: ProposalVoteProps) {
  return (
    <span style={{ 
      display: "inline-block",
      margin: "0.2rem",
      padding: "0.2rem 0.5rem",
      border: "1px solid",
      borderColor: vote ? "#4caf50" : "#f44336",
      backgroundColor: vote ? "#e8f5e9" : "#ffebee",
      borderRadius: "4px",
      fontSize: "0.9em"
    }}>
      {playerName}: {vote ? "✓" : "✗"}
    </span>
  );
}