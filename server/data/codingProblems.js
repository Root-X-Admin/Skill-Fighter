module.exports = [
    {
        id: 'factorial',
        title: 'Factorial of a Number',
        description: 'Write a function that returns the factorial of a given number.',
        input: '5\n',
        expectedOutput: '120\n',
        constraints: '1 <= n <= 20'
    },
    {
        id: 'reverse-string',
        title: 'Reverse a String',
        description: 'Write a function to reverse a given string.',
        input: 'hello\n',
        expectedOutput: 'olleh\n',
        constraints: '1 <= length <= 100'
    },
    {
        id: 'sum-array',
        title: 'Sum of an Array',
        description: 'Write a function that returns the sum of elements in an array.',
        input: '1 2 3 4 5\n',
        expectedOutput: '15\n',
        constraints: '1 <= array.length <= 1000'
    },
    {
        id: 'palindrome-check',
        title: 'Palindrome Check',
        description: 'Write a function to check if a string is a palindrome.',
        input: 'racecar\n',
        expectedOutput: 'true\n',
        constraints: '1 <= length <= 100'
    },
    {
        id: 'second-largest',
        title: 'Second Largest Element',
        description: 'Write a function to return the second largest element in an array.',
        input: '1 5 3 9 2\n',
        expectedOutput: '5\n',
        constraints: '2 <= array.length <= 1000'
    },
    {
        id: 'fibonacci-nth',
        title: 'Nth Fibonacci Number',
        description: 'Write a function to return the Nth number in the Fibonacci sequence (0-indexed).',
        input: '6\n',
        expectedOutput: '8\n',
        constraints: '0 <= n <= 30'
    },
    {
        id: 'count-vowels',
        title: 'Count Vowels in String',
        description: 'Write a function that returns the number of vowels in a string.',
        input: 'education\n',
        expectedOutput: '5\n',
        constraints: '1 <= length <= 100'
    },
    {
        id: 'is-even',
        title: 'Is Number Even?',
        description: 'Write a function that returns true if the given number is even, else false.',
        input: '4\n',
        expectedOutput: 'true\n',
        constraints: '0 <= n <= 1000'
    }
];
