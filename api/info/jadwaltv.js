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
async function scrapeJadwalTV(channel) {
    const baseUrl = "https://www.jadwaltv.net";
    const jadwalTVNowUrl = `${baseUrl}/channel/acara-tv-nasional-saat-ini`;
    const jadwalChannelUrl = `${baseUrl}/channel/${channel}`;
    try {
        let url;
        if (!channel) {
            url = jadwalTVNowUrl;
        }
        else {
            url = jadwalChannelUrl.toLowerCase();
        }
        const { data } = await axios_1.default.get(url, {
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        const $ = cheerio.load(data);
        if (!channel) {
            const jadwal = [];
            let currentChannel = "";
            $("table.table-bordered tbody tr").each((index, element) => {
                const isChannelRow = $(element).find("td[colspan=2]").length > 0;
                if (isChannelRow) {
                    currentChannel = $(element).find("a").text().trim();
                }
                else {
                    const jam = $(element).find("td").first().text().trim();
                    const acara = $(element).find("td").last().text().trim();
                    if (jam && acara && currentChannel) {
                        const existingChannel = jadwal.find((j) => j.channel === currentChannel);
                        if (existingChannel) {
                            existingChannel.jadwal.push({ jam, acara });
                        }
                        else {
                            jadwal.push({
                                channel: currentChannel,
                                jadwal: [{ jam, acara }],
                            });
                        }
                    }
                }
            });
            return { status: true, data: jadwal };
        }
        else {
            const jadwal = [];
            $("table.table-bordered tbody tr").each((index, element) => {
                const jam = $(element).find("td").first().text().trim();
                const acara = $(element).find("td").last().text().trim();
                if (jam && acara && jam !== "Jam" && acara !== "Acara") {
                    jadwal.push({ jam, acara });
                }
            });
            return { status: true, data: jadwal };
        }
    }
    catch (error) {
        console.error("Error during scraping:", error.message);
        return { status: false, error: error.message };
    }
}
async function getTVChannels() {
    const url = "https://www.jadwaltv.net/";
    try {
        const { data } = await axios_1.default.get(url, {
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        const $ = cheerio.load(data);
        const channels = [];
        $(".table-bordered tbody tr td a").each((_, element) => {
            const channel = $(element).text().trim();
            const url = $(element).attr("href")?.split("/").pop();
            if (channel && url) {
                channels.push({ channel, url });
            }
        });
        return { status: true, data: channels };
    }
    catch (error) {
        console.error("Error fetching channels:", error.message);
        return { status: false, error: error.message };
    }
}
exports.default = [
    {
        metode: "GET",
        endpoint: "/api/info/jadwaltv",
        name: "jadwalTV",
        category: "Info",
        description: "This API endpoint allows you to retrieve the current TV schedule for various national channels in Indonesia. You can either fetch the schedules for all available national channels at the moment or specify a particular channel to get its detailed schedule. This is useful for applications that need to display up-to-date television programming information, such as TV guides, media portals, or smart home integrations. The response includes the broadcast time and the name of the program for each entry.",
        tags: ["Info", "TV", "Schedule"],
        example: "?channel=sctv",
        parameters: [
            {
                name: "channel",
                in: "query",
                required: false,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 50,
                },
                description: "The name of the TV channel to get the schedule for (e.g., sctv). Leave empty to get the schedule for all national channels.",
                example: "sctv",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { channel } = req.query || {};
            if (channel && typeof channel !== "string") {
                return {
                    status: false,
                    error: "Channel parameter must be a string",
                    code: 400,
                };
            }
            if (channel && channel.trim().length === 0) {
                return {
                    status: false,
                    error: "Channel parameter cannot be empty",
                    code: 400,
                };
            }
            if (channel && channel.length > 50) {
                return {
                    status: false,
                    error: "Channel parameter must be less than 50 characters",
                    code: 400,
                };
            }
            try {
                const result = await scrapeJadwalTV(channel);
                if (!result.status) {
                    return {
                        status: false,
                        error: result.error || "Failed to retrieve TV schedule",
                        code: 500,
                    };
                }
                return {
                    status: true,
                    data: result.data,
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
        endpoint: "/api/info/jadwaltv",
        name: "jadwalTV",
        category: "Info",
        description: "This API endpoint allows you to retrieve the current TV schedule for various national channels in Indonesia. You can either fetch the schedules for all available national channels at the moment or specify a particular channel to get its detailed schedule. This is useful for applications that need to display up-to-date television programming information, such as TV guides, media portals, or smart home integrations. The response includes the broadcast time and the name of the program for each entry.",
        tags: ["Info", "TV", "Schedule"],
        example: "",
        requestBody: {
            required: false,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            channel: {
                                type: "string",
                                description: "The name of the TV channel to get the schedule for (e.g., sctv). Leave empty to get the schedule for all national channels.",
                                example: "sctv",
                                minLength: 1,
                                maxLength: 50,
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
            const { channel } = req.body || {};
            if (channel && typeof channel !== "string") {
                return {
                    status: false,
                    error: "Channel parameter must be a string",
                    code: 400,
                };
            }
            if (channel && channel.trim().length === 0) {
                return {
                    status: false,
                    error: "Channel parameter cannot be empty",
                    code: 400,
                };
            }
            if (channel && channel.length > 50) {
                return {
                    status: false,
                    error: "Channel parameter must be less than 50 characters",
                    code: 400,
                };
            }
            try {
                const result = await scrapeJadwalTV(channel);
                if (!result.status) {
                    return {
                        status: false,
                        error: result.error || "Failed to retrieve TV schedule",
                        code: 500,
                    };
                }
                return {
                    status: true,
                    data: result.data,
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
