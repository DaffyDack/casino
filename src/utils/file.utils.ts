/**
 *
 * @param mimeType
 * @returns
 * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
 */
export function parseMimeType(mimeType: string): // prettier-ignore
{
  type?: 'audio' | 'image' | 'video'
  subtype?: 
    // image
    | 'jpeg'
    | 'png'
    | 'gif'
    | 'bmp'
    | 'webp'
    // audio
    | 'ogg'
    | 'wav'
    // video
    | 'mp4'
  parameters?: Record<string, string>
} {
  const matches = mimeType.match(/^([\w]+)\/([\w]+);?(.*)$/)
  return !matches
    ? {}
    : {
        type: matches[1] as any,
        subtype: matches[2] as any,
        parameters: matches[3]
          ?.split(';')
          .filter((x) => x.trim())
          .reduce(
            (acc, x) => ({
              ...acc,
              [(x.split('=')[0] || x).trim()]: x.split('=')[1]?.trim(),
            }),
            {},
          ),
      }
}
