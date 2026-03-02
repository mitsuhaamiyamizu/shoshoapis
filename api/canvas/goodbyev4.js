"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const canvafy = __importStar(require("canvafy"));
const file_type_1 = require("file-type");
const createImageResponse = (buffer, filename = null) => {
    const headers = {
        "Content-Type": "image/png",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
    };
    if (filename) {
        headers["Content-Disposition"] = `inline; filename="${filename}"`;
    }
    return new Response(buffer, { headers });
};
function isValidImageUrl(url) {
    try {
        const parsed = new URL(url);
        const path = parsed.pathname.toLowerCase();
        const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
        return validExtensions.some((ext) => path.endsWith(ext));
    }
    catch {
        return false;
    }
}
async function isValidImageBuffer(buffer) {
    const type = await (0, file_type_1.fileTypeFromBuffer)(buffer);
    return type !== undefined && ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"].includes(type.mime);
}
async function generateGoodbyeImageFromUrl(avatar, background, description) {
    const image = await new canvafy.WelcomeLeave()
        .setAvatar(proxy() + avatar)
        .setBackground("image", proxy() + background)
        .setTitle("Goodbye")
        .setDescription(description)
        .setBorder("#2a2e35")
        .setAvatarBorder("#2a2e35")
        .setOverlayOpacity(0.3)
        .build();
    return image;
}
async function generateGoodbyeImageFromFile(avatarBuffer, backgroundBuffer, description) {
    const image = await new canvafy.WelcomeLeave()
        .setAvatar(avatarBuffer)
        .setBackground("image", backgroundBuffer)
        .setTitle("Goodbye")
        .setDescription(description)
        .setBorder("#2a2e35")
        .setAvatarBorder("#2a2e35")
        .setOverlayOpacity(0.3)
        .build();
    return image;
}
exports.default = [
    {
        metode: "GET",
        endpoint: "/api/canvas/goodbyev4",
        name: "goodbye v4",
        category: "Canvas",
        description: "Generate a customizable goodbye image (version 4) using Canvafy. This API allows you to create a personalized farewell banner by providing URLs for the user's avatar and a background image, along with a custom description. It's ideal for use in Discord bots or other community platforms to create engaging visual messages when a user leaves. The output is a high-quality PNG image.",
        tags: ["CANVAS", "Image Generation", "Goodbye Image", "Discord", "Canvafy"],
        example: "?avatar=https://i.ibb.co/1s8T3sY/48f7ce63c7aa.jpg&background=https://i.ibb.co/4YBNyvP/images-76.jpg&description=Goodbye%20friend!",
        parameters: [
            {
                name: "avatar",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    format: "url",
                },
                description: "URL of the user's avatar.",
                example: "https://i.ibb.co/1s8T3sY/48f7ce63c7aa.jpg",
            },
            {
                name: "background",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    format: "url",
                },
                description: "URL of the background image.",
                example: "https://i.ibb.co/4YBNyvP/images-76.jpg",
            },
            {
                name: "description",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                },
                description: "The goodbye description text.",
                example: "Goodbye friend!",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { avatar, background, description } = req.query || {};
            if (typeof avatar !== "string" || avatar.trim().length === 0) {
                return {
                    status: false,
                    error: "Avatar URL is required and must be a non-empty string",
                    code: 400,
                };
            }
            if (typeof background !== "string" || background.trim().length === 0) {
                return {
                    status: false,
                    error: "Background URL is required and must be a non-empty string",
                    code: 400,
                };
            }
            if (typeof description !== "string" || description.trim().length === 0) {
                return {
                    status: false,
                    error: "Description is required and must be a non-empty string",
                    code: 400,
                };
            }
            const imageUrls = [avatar, background];
            const invalidUrls = imageUrls.filter((url) => !isValidImageUrl(url));
            if (invalidUrls.length > 0) {
                return {
                    status: false,
                    error: "Invalid image URL provided. Only JPG, JPEG, PNG, GIF, WEBP are supported.",
                    code: 400,
                };
            }
            try {
                const image = await generateGoodbyeImageFromUrl(avatar.trim(), background.trim(), description.trim());
                return createImageResponse(image);
            }
            catch (error) {
                return {
                    status: false,
                    error: error.message || "Internal Server Error",
                    code: 500,
                };
            }
        },
    },
    {
        metode: "POST",
        endpoint: "/api/canvas/goodbyev4",
        name: "goodbye v4",
        category: "Canvas",
        description: "Generate a customizable goodbye image (version 4) using Canvafy. This API allows you to create a personalized farewell banner by uploading image files for the user's avatar and background, along with a custom description. It's ideal for applications that require direct file uploads to generate engaging visual messages when a user leaves. The output is a high-quality PNG image.",
        tags: ["CANVAS", "Image Generation", "Goodbye Image", "Discord", "Canvafy", "Upload"],
        example: "",
        requestBody: {
            required: true,
            content: {
                "multipart/form-data": {
                    schema: {
                        type: "object",
                        properties: {
                            avatar: {
                                type: "string",
                                format: "binary",
                                description: "Image file for the avatar (JPG, JPEG, PNG, GIF, WEBP).",
                            },
                            background: {
                                type: "string",
                                format: "binary",
                                description: "Image file for the background (JPG, JPEG, PNG, GIF, WEBP).",
                            },
                            description: {
                                type: "string",
                                description: "The goodbye description text.",
                                example: "Goodbye friend!",
                                minLength: 1,
                            },
                        },
                        required: ["avatar", "background", "description"],
                    },
                },
            },
        },
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req, guf }) {
            const { description } = req.body || {};
            if (typeof description !== "string" || description.trim().length === 0) {
                return {
                    status: false,
                    error: "Description is required and must be a non-empty string",
                    code: 400,
                };
            }
            const avatarFile = await guf(req, "avatar");
            const backgroundFile = await guf(req, "background");
            if (!avatarFile || !avatarFile.file) {
                return {
                    status: false,
                    error: "Avatar file is required",
                    code: 400,
                };
            }
            if (!avatarFile.isValid || !avatarFile.isImage) {
                return {
                    status: false,
                    error: `Invalid avatar file: ${avatarFile.name}. Supported: JPG, JPEG, PNG, GIF, WEBP`,
                    code: 400,
                };
            }
            if (!backgroundFile || !backgroundFile.file) {
                return {
                    status: false,
                    error: "Background file is required",
                    code: 400,
                };
            }
            if (!backgroundFile.isValid || !backgroundFile.isImage) {
                return {
                    status: false,
                    error: `Invalid background file: ${backgroundFile.name}. Supported: JPG, JPEG, PNG, GIF, WEBP`,
                    code: 400,
                };
            }
            try {
                const image = await generateGoodbyeImageFromFile(avatarFile.file, backgroundFile.file, description.trim());
                return createImageResponse(image);
            }
            catch (error) {
                return {
                    status: false,
                    error: error.message || "Internal Server Error",
                    code: 500,
                };
            }
        },
    },
];
