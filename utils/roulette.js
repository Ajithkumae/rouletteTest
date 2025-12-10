export const NUMBERS = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

export const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

export const isRed = (num) => RED_NUMBERS.includes(num);

export const getNumberColor = (num) => {
    if (num === 0) return 'green';
    return isRed(num) ? 'red' : 'black';
};

export const getNumberColorVar = (num) => {
    if (num === 0) return 'var(--felt-green)';
    return isRed(num) ? 'var(--red-roulette)' : 'var(--black-roulette)';
};
