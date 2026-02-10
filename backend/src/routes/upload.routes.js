const path = require("path");
const fs = require("fs");
const { UPLOADS_DIR } = require("../config/constants");

async function uploadRoutes(fastify, options) {
    fastify.post("/eltrinche/api/upload", async (req, reply) => {
        const data = await req.file();
        if (!data) return reply.status(400).send({ error: "No file uploaded" });

        const filename = `${Date.now()}_${data.filename}`;
        const filepath = path.join(UPLOADS_DIR, filename);

        await new Promise((resolve, reject) => {
            const pump = require('stream').pipeline;
            pump(data.file, fs.createWriteStream(filepath), err => {
                if (err) reject(err);
                else resolve();
            });
        });

        return { success: true, url: `/eltrinche/uploads/${filename}` };
    });
}

module.exports = uploadRoutes;
