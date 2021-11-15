import { GuildMember } from 'discord.js';
import { createCanvas, loadImage, CanvasRenderingContext2D as ctx2D, Canvas, Image } from 'canvas';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { Gradient, Theme } from '@discord-card/core';
export { Gradient, Theme } from '@discord-card/core';
let channel = client.channels.resolve("909618960566190141")


const production = true;

function getFontSize(str: string) {
    if (str.length < 18) return 30;
    return (600 * Math.pow(str.length, -1.05)).toFixed(0);
}

async function toImage(image: ImageResolvable, name?: string) {
    if (image instanceof Canvas) {
        let img = new Image();
        img.src = (image as Canvas).toDataURL();
        return img;
    } else if (image instanceof Image)
        return image
    else if (typeof image === 'string' || image instanceof Buffer)
        return await loadImage(image)
    else throw new Error('Invalid Image Format for: ' + name ?? 'Image');
}

const root = join(__dirname, '..', 'images')
export var themes = {
    'dark': { color: '#ffffff', image: join(root, 'dark.png') },
    'circuit': { color: '#ffffff', image: join(root, 'circuit.png') },
    'code': { color: '#ffffff', image: join(root, 'code.png'), font: 'Source Sans Pro' },
}

const { Client, Intents } = require("discord.js");
const { drawCard } = require('discord-welcome-card');
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
}

type Color = `##ffffff`;
type ImageResolvable = Canvas | Image | Buffer | string;
client.on("messageCreate", async message => {
    if(message.author.bot) return
     const image = await drawCard({
        /** Select a theme with some default options */
        theme: "circuit",
        /** Options for the text on the card */
        text: {
            /** Text in the Top */
            title: 'this is a test ${member.guild.name}',
            /**Text in the middle(big) */
            text: 'test de 5 pesos',
            /** Text on the bottom */
            subtitle: 'si #${member.guild.memberCount}',
            /** Font Color */
            color:  '#ffffff'
            /** Custom Font */
            font: monospaced
        },
        /** Options for the avatar */
        avatar: {
            /** The Avatar Image, can be a URL/Canvas/Image or Buffer */
            image: message.author.displayAvatarURL({ format: 'png' }),
            /** Width of the outline around the avatar */
            outlineWidth: 3,
            /** Color of the outline */
            outlineColor: '#ffffff'
        }
        /** Override the Background, can be a URL/Canvas/Image or Buffer  */
        background: 'https://i.imgur.com/IMgtthp.jpeg,',
        /** If the background should be blurred (true -> 3) */
        blur: 3,
        /** When enabled a blurred border is drawn, enabled by default */
        border: true,
        /** If enabled the edges will be rounded, enabled by default */
        rounded?: true,
        //custom?: ModuleFunction;
    }
    message.channel.send({ files: [ image ] })
}
client.login('Your-Bot-Token');


var count = 0;
function snap(c: Canvas) {
    if (!production) writeFileSync(`./testing/snapshots/${count}.png`, c.toBuffer('image/png'));
    count++;
}


export async function drawCard(options: CardOptions): Promise<Buffer> {
    const w = 700, h = 250;
    const canvas = createCanvas(w, h);
    const ctx = canvas.getContext('2d');
    ctx.w = ctx.width = w;
    ctx.h = ctx.height = h;

    //@ts-ignore
    let theme: Theme;
    let background: Image;

    options.border ??= true;
    options.rounded ??= true;

    //Parsing the Theme
    if (typeof (options.theme ?? 'code') === 'string') {
        theme = themes[options.theme ?? 'code'];
        if (!theme) throw new Error('Invalid theme, use: ' + Object.keys(themes).join(' | '));

        background = await loadImage(theme.image);
    } else throw new Error('Invalid theme, use: ' + Object.keys(themes).join(' | '));

    if (options.background) background = await toImage(options.background, 'Background');

    ctx.theme = theme;
    /** Border width */
    const b = 10; //Border

    //Background
    snap(canvas);
    if (options.rounded) ctx.roundRect(0, 0, w, h, h / 15);
    else ctx.rect(0, 0, w, h);
    ctx.clip();

    if (options.border) {
        ctx.drawImage(background, 0, 0, w, h);
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;

        ctx.blur(3);
    }


    snap(canvas);
    //Rounded Edges
    if (options.border) {
        if (options.rounded) {
            ctx.roundRect(
                b, b,
                w - 2 * b, h - 2 * b,
                h / 20
            );
        } else {
            ctx.rect(
                b, b,
                w - (2 * b), h - (2 * b)
            );
        }
        ctx.clip();
    } else {
        if (options.rounded) ctx.roundRect(0, 0, w, h, h / 15).clip();
        else ctx.rect(0, 0, w, h);
    }


    var temp: Canvas | Image = background;
    if (options.blur) {
        var blur = createCanvas(w, h), blur_ctx = blur.getContext('2d') as ctx2D;
        blur_ctx.drawImage(background, 0, 0, w, h);

        if (typeof options.blur === 'boolean') blur_ctx.blur(3);
        else blur_ctx.blur(options.blur);

        temp = blur;
    }
    if (options.border) ctx.drawImage(temp, b, b, w - b * 2, h - b * 2);
    else ctx.drawImage(temp, 0, 0, w, h);


    snap(canvas);


    //Setting Styles
    ctx.fillStyle = (options.text?.color ?? theme.color).toString(ctx);
    //ctx.strokeStyle = theme.color.toString(ctx);
    ctx.font = '30px ' + ((options.text?.font ?? theme.font) ?? 'sans-serif', 'segoe-ui-emoji');


    //Drawing
    //Title
    ctx.changeFontSize('30px')
        .fillText(options.text?.title ?? '', ctx.width / 2.7, ctx.height / 3.5);

    //Text
    ctx.changeFontSize(getFontSize(options.text?.text ?? '') + 'px')
        .fillText(options.text?.text ?? '', ctx.width / 2.7, ctx.height / 1.8);

    //Subtitle
    ctx.changeFontSize('25px')
        .fillText(options.text?.subtitle ?? '', ctx.width / 2.7, ctx.height / 1.3);

    //Avatar Image
    const radius = h / 2.5;

    ctx.lineWidth = 6
    ctx.beginPath();
    ctx.arc(h / 2, h / 2, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    const { avatar } = options;
    if (avatar) {
        const { image: avatarImage, outlineWidth, outlineColor } = avatar;
        if (avatarImage) {
            ctx.drawImage(
                await toImage(avatarImage),
                ((h / 2) - radius) + (avatar.outlineWidth ?? 0), //x
                ((h / 2) - radius) + (avatar.outlineWidth ?? 0), //y
                (radius * 2) - (avatar.outlineWidth ?? 0) * 2, //width
                (radius * 2) - (avatar.outlineWidth ?? 0) * 2//height
            );
        }

        if (outlineWidth) {
            ctx.beginPath();
            ctx.arc(h / 2, h / 2, radius - (outlineWidth / 2), 0, Math.PI * 2, true);
            ctx.closePath();

            ctx.lineWidth = outlineWidth;
            ctx.strokeStyle = (outlineColor ?? theme.color ?? '#fff').toString(ctx);

            ctx.stroke();
        }
    }

    snap(canvas);


    return canvas.toBuffer('image/png');
}


export async function welcomeImage(member: GuildMember, options: CardOptions = { }): Promise<Buffer> {
    const opts = { ...options }
    opts.text ??= { }
    opts.avatar ??= { }

    opts.text.title ??= `Welcome to this server,`;
    opts.text.text ??= `${member.user.tag}!`;
    opts.text.subtitle ??= `MemberCount: ${member.guild.memberCount}`;
    opts.avatar.image ??= await loadImage(member.user.displayAvatarURL({ format: 'png' }));

    return await drawCard(opts);
}


export async function goodbyeImage(member: GuildMember, options: CardOptions = { }): Promise<Buffer> {
    const opts = { ...options }
    opts.text ??= { }
    opts.avatar ??= { }

    opts.text.title ??= `Goodbye,`;
    opts.text.text ??= `${member.user.tag}!`;
    opts.avatar.image ??= await loadImage(member.user.displayAvatarURL({ format: 'png' }));

    return await drawCard(opts);
}
