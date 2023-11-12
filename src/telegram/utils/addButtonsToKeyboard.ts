import { groupBy } from "./groupBy";

export async function addButtonsToKeyboard(arr: string[], amountButtonsPerLine: number): Promise<{ text: string }[][]> {
    const keyboardButtons = await groupBy(
      arr.map((item) => ({ text: item })),
      amountButtonsPerLine,
    );
    return keyboardButtons;
  }