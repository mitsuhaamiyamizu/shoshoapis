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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
async function scrapeSeegore(url) {
    try {
        const response = await axios_1.default.get(url, {
            timeout: 30000,
        });
        const html = response.data;
        const $ = cheerio.load(html);
        const title = $("h1.entry-title.s-post-title.bb-mb-el[itemprop=\"headline\"]")
            .text()
            .trim();
        const author = $("div.bb-author-vcard-mini span[itemprop=\"name\"]")
            .text()
            .trim();
        const postedOn = $("time.entry-date.published").attr("datetime");
        const commentsCount = $("a.post-meta-item.post-comments .count")
            .text()
            .trim();
        const viewsCount = $("span.post-meta-item.post-views .count")
            .first()
            .text()
            .trim();
        const ratingValue = $(".wpd-rating-value .wpdrv").text().trim();
        const ratingCount = $(".wpd-rating-value .wpdrc").text().trim();
        const ratingVotes = $(".wpd-rating-title").next().text().trim();
        const videoSrc = $("video.wp-video-shortcode source[type=\"video/mp4\"]").attr("src");
        return {
            title: title,
            author: author,
            postedOn: postedOn,
            commentsCount: commentsCount,
            viewsCount: viewsCount,
            rating: {
                value: ratingValue,
                count: ratingCount,
                votes: ratingVotes,
            },
            videoSrc: videoSrc,
        };
    }
    catch (error) {
        console.error("Error fetching data:", error);
        throw new Error(error.message || "Failed to get response from API");
    }
}
exports.default = [
    {
        metode: "GET",
        endpoint: "/api/d/seegore",
        name: "seegore",
        category: "Downloader",
        description: "This API endpoint allows you to fetch article data from a Seegore URL using query parameters. It extracts various details such as the article title, author, publication date, number of comments, view count, rating information (value, count, votes), and the source URL of any embedded video. This is useful for content analysis, archiving, or integrating Seegore content into other applications.",
        tags: ["Downloader", "Article", "Video", "Scraper", "Seegore"],
        example: "?url=https://seegore.com/train-gives-a-warm-welcome-to-grandma",
        parameters: [
            {
                name: "url",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                },
                description: "The Seegore article URL to fetch data from",
                example: "https://seegore.com/train-gives-a-warm-welcome-to-grandma",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { url } = req.query || {};
            if (!url) {
                return {
                    status: false,
                    error: "URL parameter is required",
                    code: 400,
                };
            }
            if (typeof url !== "string" || url.trim().length === 0) {
                return {
                    status: false,
                    error: "URL must be a non-empty string",
                    code: 400,
                };
            }
            try {
                const result = await scrapeSeegore(url.trim());
                if (!result) {
                    return {
                        status: false,
                        error: "Failed to fetch article data",
                        code: 500,
                    };
                }
                return {
                    status: true,
                    data: result,
                    timestamp: new Date().toISOString(),
                };
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
        endpoint: "/api/d/seegore",
        name: "seegore",
        category: "Downloader",
        description: "This API endpoint allows you to fetch article data from a Seegore URL by providing the URL in the request body as JSON. It extracts various details such as the article title, author, publication date, number of comments, view count, rating information (value, count, votes), and the source URL of any embedded video. This is useful for content analysis, archiving, or integrating Seegore content into other applications programmatically.",
        tags: ["Downloader", "Article", "Video", "Scraper", "Seegore"],
        example: "",
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        required: ["url"],
                        properties: {
                            url: {
                                type: "string",
                                description: "The Seegore article URL to fetch data from",
                                example: "https://seegore.com/train-gives-a-warm-welcome-to-grandma",
                                minLength: 1,
                            },
                        },
                        additionalProperties: false,
                    },
                },
            },
        },
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { url } = req.body || {};
            if (!url) {
                return {
                    status: false,
                    error: "URL parameter is required",
                    code: 400,
                };
            }
            if (typeof url !== "string" || url.trim().length === 0) {
                return {
                    status: false,
                    error: "URL must be a non-empty string",
                    code: 400,
                };
            }
            try {
                const result = await scrapeSeegore(url.trim());
                if (!result) {
                    return {
                        status: false,
                        error: "Failed to fetch article data",
                        code: 500,
                    };
                }
                return {
                    status: true,
                    data: result,
                    timestamp: new Date().toISOString(),
                };
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
