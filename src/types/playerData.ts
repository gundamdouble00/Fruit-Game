export interface Round {
  round: number;
  fruit: string;
  reactionTime: number;
  success: boolean;
  msg: string;
  bgColor: string;
}

export interface Item {
  id: string;
  createdAt: string;
  round: Round[];
}
