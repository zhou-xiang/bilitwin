// @ts-check

/**
 * @param {number} alpha 0~255
 */
const formatColorChannel = (alpha) => {
    return (alpha & 255).toString(16).toUpperCase().padStart(2, '0')
}

/**
 * @param {number} opacity 0 ~ 1 -> alpha 0 ~ 255
 */
const formatOpacity = (opacity) => {
    const alpha = 0xFF * (100 - +opacity * 100) / 100
    return formatColorChannel(alpha)
}

/**
 * "#xxxxxx" -> "xxxxxx"
 * @param {string} colorStr 
 */
const formatColor = (colorStr) => {
    colorStr = colorStr.toUpperCase()
    const m = colorStr.match(/^#?(\w{6})$/)
    return m[1]
}

const buildHeader = ({
    title = "",
    original = "",
    fontFamily = "Arial",
    bold = false,
    textColor = "#FFFFFF",
    bgColor = "#000000",
    textOpacity = 1.0,
    bgOpacity = 0.5,
    fontsizeRatio = 0.4,
    baseFontsize = 50,
    playResX = 560,
    playResY = 420,
}) => {
    textColor = formatColor(textColor)
    bgColor = formatColor(bgColor)

    const boldFlag = bold ? -1 : 0
    const fontSize = Math.round(fontsizeRatio * baseFontsize)
    const textAlpha = formatOpacity(textOpacity)
    const bgAlpha = formatOpacity(bgOpacity)

    return [
        "[Script Info]",
        `Title: ${title}`,
        `Original Script: ${original}`,
        "ScriptType: v4.00+",
        "Collisions: Normal",
        `PlayResX: ${playResX}`,
        `PlayResY: ${playResY}`,
        "Timer: 100.0000",
        "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
        `Style: Fix,${fontFamily},${fontSize},&H${textAlpha}${textColor},&H${textAlpha}${textColor},&H${textAlpha}000000,&H${bgAlpha}${bgColor},${boldFlag},0,0,0,100,100,0,0,1,2,0,2,20,20,2,0`,
        "",
        "[Events]",
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ]
}

/**
 * @param {number} time 
 */
const formatTimestamp = (time) => {
    const value = Math.round(time * 100) * 10
    const rem = value % 3600000
    const hour = (value - rem) / 3600000
    const fHour = hour.toFixed(0).padStart(2, '0')
    const fRem = new Date(rem).toISOString().slice(-11, -2)
    return fHour + fRem
}

/**
 * @param {string} str 
 */
const textEscape = (str) => {
    // VSFilter do not support escaped "{" or "}"; we use full-width version instead
    return str.replace(/{/g, '｛').replace(/}/g, '｝').replace(/\s/g, ' ')
}

/**
 * @param {import("./index").Dialogue} dialogue 
 */
const buildLine = (dialogue) => {
    const start = formatTimestamp(dialogue.from)
    const end = formatTimestamp(dialogue.to)
    const text = textEscape(dialogue.content)
    return `Dialogue: 0,${start},${end},Fix,,20,20,2,,${text}`
}

/**
 * @param {import("./index").SubtitleData} subtitleData 
 * @param {string} languageDoc 字幕语言描述，例如 "英语（美国）"
 */
export const buildAss = (subtitleData, languageDoc = "") => {
    const pageTitle = top.document.title.replace(/_哔哩哔哩 \(゜-゜\)つロ 干杯~-bilibili$/, "")
    const title = `${pageTitle} ${languageDoc || ""}字幕`
    const url = top.location.href
    const original = `Generated by Xmader/bilitwin based on ${url}`

    const header = buildHeader({
        title,
        original,
        fontsizeRatio: subtitleData.font_size,
        textColor: subtitleData.font_color,
        bgOpacity: subtitleData.background_alpha,
        bgColor: subtitleData.background_color,
    })

    const lines = subtitleData.body.map(buildLine)

    return [
        ...header,
        ...lines,
    ].join('\r\n')
}

export default buildAss
