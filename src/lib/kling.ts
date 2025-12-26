import { generateVideoFromImage, getKlingTaskStatus } from "../shared/kling.server.js";

export const klingService = {
    generateVideo: generateVideoFromImage,
    checkVideoStatus: getKlingTaskStatus,
};
