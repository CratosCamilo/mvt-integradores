import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: "coverage",
    roots: ["<rootDir>/test"],
    moduleFileExtensions: ["ts", "js", "json", "node"],
    testEnvironment: 'node',
    testMatch: ['**/test/**/*.test.ts'], 
    transform: { 
        '^.+\\.ts$': ['ts-jest', {
            tsconfig: {
                module: 'commonjs',
                esModuleInterop: true
            }
        }] 
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/**/types/**',
        '!src/index.ts'
    ]
};

export default config;