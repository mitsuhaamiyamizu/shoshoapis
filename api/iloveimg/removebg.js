"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const file_type_1 = require("file-type");
const path_1 = __importDefault(require("path"));
const buffer_1 = require("buffer");
const form_data_1 = __importDefault(require("form-data"));
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
class UpscaleImageAPI {
    api;
    server;
    taskId;
    token;
    constructor() {
        this.api = null;
        this.server = null;
        this.taskId = null;
        this.token = null;
    }
    async getTaskId() {
        try {
            const { data: html } = await axios_1.default.get("https://www.iloveimg.com/remove-background", {
                timeout: 10000,
            });
            const tokenMatches = html.match(/(ey[a-zA-Z0-9?%-_/]+)/g);
            if (!tokenMatches || tokenMatches.length < 2) {
                throw new Error("Token not found.");
            }
            this.token = tokenMatches[1];
            const configMatch = html.match(/var ilovepdfConfig = ({.*?});/s);
            if (!configMatch) {
                throw new Error("Server configuration not found.");
            }
            const configJson = JSON.parse(configMatch[1]);
            const servers = configJson.servers;
            if (!Array.isArray(servers) || servers.length === 0) {
                throw new Error("Server list is empty.");
            }
            this.server = servers[Math.floor(Math.random() * servers.length)];
            this.taskId = html.match(/taskId\s*=\s*'(\w+)/)?.[1];
            this.api = axios_1.default.create({ baseURL: `https://${this.server}.iloveimg.com` });
            this.api.defaults.headers.post["authorization"] = `Bearer ${this.token}`;
            if (!this.taskId)
                throw new Error("Task ID not found!");
            return { taskId: this.taskId };
        }
        catch (error) {
            throw new Error(`Failed to get Task ID: ${error.message}`);
        }
    }
    async uploadFromUrl(imageUrl) {
        if (!this.taskId || !this.api) {
            throw new Error("Task ID or API not available. Run getTaskId() first.");
        }
        try {
            const imageResponse = await axios_1.default.get(imageUrl, {
                responseType: "arraybuffer",
                timeout: 15000,
            });
            const fileType = await (0, file_type_1.fileTypeFromBuffer)(imageResponse.data);
            if (!fileType || !fileType.mime.startsWith("image/")) {
                throw new Error("File type is not a supported image.");
            }
            const buffer = buffer_1.Buffer.from(imageResponse.data, "binary");
            const urlPath = new URL(imageUrl).pathname;
            const fileName = path_1.default.basename(urlPath) || `image.${fileType.ext}`;
            const form = new form_data_1.default();
            form.append("name", fileName);
            form.append("chunk", "0");
            form.append("chunks", "1");
            form.append("task", this.taskId);
            form.append("preview", "1");
            form.append("pdfinfo", "0");
            form.append("pdfforms", "0");
            form.append("pdfresetforms", "0");
            form.append("v", "web.0");
            form.append("file", buffer, { filename: fileName, contentType: fileType.mime });
            const response = await this.api.post("/v1/upload", form, {
                headers: form.getHeaders(),
                data: form,
            });
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }
    async uploadFromFile(fileBuffer, fileName) {
        if (!this.taskId || !this.api) {
            throw new Error("Task ID or API not available. Run getTaskId() first.");
        }
        try {
            const fileType = await (0, file_type_1.fileTypeFromBuffer)(fileBuffer);
            if (!fileType || !fileType.mime.startsWith("image/")) {
                throw new Error("File type is not a supported image.");
            }
            const form = new form_data_1.default();
            form.append("name", fileName);
            form.append("chunk", "0");
            form.append("chunks", "1");
            form.append("task", this.taskId);
            form.append("preview", "1");
            form.append("pdfinfo", "0");
            form.append("pdfforms", "0");
            form.append("pdfresetforms", "0");
            form.append("v", "web.0");
            form.append("file", fileBuffer, { filename: fileName, contentType: fileType.mime });
            const response = await this.api.post("/v1/upload", form, {
                headers: form.getHeaders(),
                data: form,
            });
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }
    async removebgImage(serverFilename) {
        if (!this.taskId || !this.api) {
            throw new Error("Task ID or API not available. Run getTaskId() first.");
        }
        const form = new form_data_1.default();
        form.append("task", this.taskId);
        form.append("server_filename", serverFilename);
        try {
            const response = await this.api.post("/v1/removebackground", form, {
                headers: form.getHeaders(),
                data: form,
                responseType: "arraybuffer",
            });
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to remove background: ${error.message}`);
        }
    }
}
async function scrapeRemoveBgFromUrl(imageUrl) {
    const removebg = new UpscaleImageAPI();
    await removebg.getTaskId();
    const uploadResult = await removebg.uploadFromUrl(imageUrl);
    if (!uploadResult || !uploadResult.server_filename) {
        throw new Error("Failed to upload image.");
    }
    const imageBuffer = await removebg.removebgImage(uploadResult.server_filename);
    return imageBuffer;
}
async function scrapeRemoveBgFromFile(fileBuffer, fileName) {
    const removebg = new UpscaleImageAPI();
    await removebg.getTaskId();
    const uploadResult = await removebg.uploadFromFile(fileBuffer, fileName);
    if (!uploadResult || !uploadResult.server_filename) {
        throw new Error("Failed to upload image.");
    }
    const imageBuffer = await removebg.removebgImage(uploadResult.server_filename);
    return imageBuffer;
}
exports.default = [
    {
        metode: "GET",
        endpoint: "/api/iloveimg/removebg",
        name: "removebg",
        category: "Iloveimg",
        description: "Remove background from an image using a URL as a query parameter. This API endpoint allows you to intelligently detect and remove the background from an image, leaving the main subject isolated. It is ideal for creating transparent images for product listings, graphic design, or any scenario requiring a clean subject without distractions. The output will typically be a PNG image with a transparent background.",
        tags: ["ILOVEIMG", "Image Editing", "Background Removal"],
        example: "?image=https://i.pinimg.com/736x/0b/9f/0a/0b9f0a92a598e6c22629004c1027d23f.jpg",
        parameters: [
            {
                name: "image",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    format: "url",
                    minLength: 1,
                    maxLength: 2000,
                },
                description: "Image URL",
                example: "https://i.pinimg.com/736x/0b/9f/0a/0b9f0a92a598e6c22629004c1027d23f.jpg",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { image } = req.query || {};
            if (!image) {
                return {
                    status: false,
                    error: "Parameter 'image' is required.",
                    code: 400,
                };
            }
            if (typeof image !== "string" || image.trim().length === 0) {
                return {
                    status: false,
                    error: "Parameter 'image' must be a non-empty string.",
                    code: 400,
                };
            }
            try {
                new URL(image.trim());
                const imageBuffer = await scrapeRemoveBgFromUrl(image.trim());
                const fileType = await (0, file_type_1.fileTypeFromBuffer)(imageBuffer);
                const contentType = fileType ? fileType.mime : "image/png";
                return createImageResponse(imageBuffer, `removebg_image.png`);
            }
            catch (error) {
                console.error("Error:", error);
                return {
                    status: false,
                    error: error.message || "An error occurred while processing the image.",
                    code: 500,
                };
            }
        },
    },
    {
        metode: "POST",
        endpoint: "/api/iloveimg/removebg",
        name: "removebg",
        category: "Iloveimg",
        description: "Remove background from an image by uploading a file via multipart/form-data. This API endpoint allows you to upload an image and have its background intelligently removed, leaving the main subject isolated. It is perfect for users who need to process images directly from their local files for various creative or business purposes. The output will typically be a PNG image with a transparent background.",
        tags: ["ILOVEIMG", "Image Editing", "Background Removal", "Image Upload"],
        example: "",
        requestBody: {
            required: true,
            content: {
                "multipart/form-data": {
                    schema: {
                        type: "object",
                        required: ["image"],
                        properties: {
                            image: {
                                type: "string",
                                format: "binary",
                                description: "The image file to remove background from.",
                            },
                        },
                    },
                },
            },
        },
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req, guf }) {
            try {
                const { file: fileBuffer, name: fileName, isImage, isValid, type } = await guf(req, "image");
                if (!fileBuffer) {
                    return {
                        status: false,
                        error: "File 'image' is required in multipart/form-data.",
                        code: 400,
                    };
                }
                if (!isValid) {
                    return {
                        status: false,
                        error: `Invalid file: ${fileName}. Size must be between 1 byte and 10MB`,
                        code: 400,
                    };
                }
                if (!isImage) {
                    return {
                        status: false,
                        error: `Invalid file type: ${type}. Supported: JPG, JPEG, PNG, GIF, WEBP`,
                        code: 400,
                    };
                }
                const imageBuffer = await scrapeRemoveBgFromFile(fileBuffer, fileName);
                return createImageResponse(imageBuffer, `removebg_image.png`);
            }
            catch (error) {
                console.error("Error:", error);
                return {
                    status: false,
                    error: error.message || "An error occurred while processing the image.",
                    code: 500,
                };
            }
        },
    },
];
