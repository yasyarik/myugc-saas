module.exports = {
    apps: [
        {
            name: "ugc-studio-saas",
            script: "npm",
            args: "run start",
            env: {
                PORT: 3010,
                NODE_ENV: "production",
            },
        },
    ],
};
