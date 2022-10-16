module.exports = {
    moduleFileExtensions: ["js", "ts", "json", "vue"],
    transform: {
        "^.+\\.jsx?$": "babel-jest",
        "^.+\\.tsx?$": ["ts-jest", { babelConfig: true }],
        "^.+\\.vue$": "@vue/vue3-jest"
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },
}
