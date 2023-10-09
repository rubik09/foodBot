import getDataFromApi from 'src/utils/googleApi/api';
import Button from 'src/types/button';

const arrToBtns = (arr: string[][]): Array<Array<Button | null>> => {
  const res: Array<Array<Button | null>> = [];
  for (let i = 0; i < arr.length; i++) {
    const btns = [];
    const el = arr[i];
    for (let j = 0; j < el.length; j += 2) {
      if (el[j]) {
        btns.push({
          button: el[j],
          text: el[j + 1] || '',
        });
      } else {
        btns.push(null);
      }
    }
    res.push(btns);
  }
  return res.filter((el) => el.length);
};

const numToZeroIdx = (num: number): string => {
  if (num < 10) return `0${num}`;
  return `0${num}`;
};

class StackPath {
  idx: number;
  arr: number[];
  delimetr: string;
  numDecorateFunc;
  constructor(delimetr: string, numDecorateFunc: (num: number) => string) {
    this.arr = [];
    this.idx = 1;
    this.delimetr = delimetr;
    this.numDecorateFunc = numDecorateFunc;
  }
  push(el: number) {
    this.arr.push(el);
  }
  peek(): number | undefined {
    return this.arr.at(-1);
  }
  get path(): string {
    return this.arr.map(this.numDecorateFunc).join(this.delimetr);
  }
  get length(): number {
    return this.arr.length;
  }
}

const genPath = (arr: Array<Array<Button | null>>): Button[] => {
  const res = [];
  const stackPath = new StackPath('-', numToZeroIdx);
  for (let i = 0; i < arr.length; i++) {
    const subarr = arr[i];
    for (let j = 0; j < subarr.length; j++) {
      const el = subarr[j];

      // check if element exist in table
      if (!el) continue;
      el.button = el.button.trim();
      el.text = el.text.trim();

      //check if element not emty (el.button always should exists)
      if (!el.button && !el.text) continue;

      if (stackPath.length < j || stackPath.length === 0) {
        stackPath.push(stackPath.idx);
      } else if (stackPath.length === j) {
        stackPath.idx = 1;
        stackPath.push(stackPath.idx);
      } else if (j) {
        stackPath.arr = stackPath.arr.slice(0, j + 1);
        stackPath.idx = (stackPath.peek() || 0) + 1;
        stackPath.arr[stackPath.length - 1] = stackPath.idx;
        stackPath.idx = 1;
      } else {
        stackPath.idx = stackPath.arr[0];
        stackPath.arr = [];
        stackPath.idx++;
        stackPath.push(stackPath.idx);
      }

      res.push({ ...el, path: stackPath.path });
    }
  }
  return res;
};

export default async function createBtns(pageNumber: number): Promise<Button[]> {
  try {
    const arr = await getDataFromApi(pageNumber);
    return genPath(arrToBtns(arr));
  } catch (err) {
    throw new Error(err);
  }
}
