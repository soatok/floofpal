const changeTime = require('change-file-time');
const fs = require('fs').promises;
const fsc = require('fs').constants;
const nodeConsole = require('console');
const randomInt = require('./csprng');
const request = require('request-promise');
let myConsole = new nodeConsole.Console(process.stdout, process.stderr);

let isWindowsAdmin = false;
if (process.platform === "win32") {
    let exec = require('child_process').exec;
    exec('NET SESSION', function (err, so, se) {
        isWindowsAdmin = se.length === 0;
    });
}

module.exports = class FloofWorker {
    constructor(state) {
        isWindowsAdmin = false;
        if (process.platform === "win32") {
            let exec = require('child_process').exec;
            exec('NET SESSION', function (err, so, se) {
                isWindowsAdmin = se.length === 0;
            });
        }
        this.animationInProgress = false;
        this.chatters = [];
        this.canary = FloofWorker.randomString(16);
        this.floofState = state;
        this.greetQueue = [];
        this.init = false;
        this.isWindowsAdmin = isWindowsAdmin;
        this.tickTimer = 1000;
    }

    /**
     * @returns {module.FloofWorker}
     */
    begin() {
        let that = this;
        // Kick off a first request/timeout loop
        setInterval(async () => { return await that.doSomeWork();}, this.tickTimer);
    }

    async kickoffAnimations() {
        if (this.animationInProgress) {
            return false;
        }
        if (this.greetQueue.length < 1) {
            // No animation to speak of...
            await this.restState();
        } else {
            this.animationInProgress = true;
            let chatter = this.greetQueue.shift();
            await this.greetNextChatter(chatter);
        }
    }

    getSpeechBubble(username) {
        return this.floofState.get('speechTemplate')
            .split('${username}').join(username);
    }

    async greetNextChatter(chatter) {
        if (this.canary !== chatter.canary) {
            return; // Abort
        }
        // Write to speech bubble file
        let message = this.getSpeechBubble(chatter.chatter);
        myConsole.log(message);
        await fs.writeFile(
            this.floofState.get('sourceText'),
            message
        );
        // Set active Image
        await this.selectImage(
            this.floofState.get('sourceImage'),
            this.floofState.get('activeImage')
        );
        let that = this;
        // Kickoff the cleanup
        setTimeout(
            async function () {
                await that.restState();
                that.animationInProgress = false;
            }, 
            this.floofState.get('timeActive')
        );
    }
    
    async restState() {
        await fs.writeFile(
            this.floofState.get('sourceText'),
            ""
        );
        await this.selectImage(
            this.floofState.get('sourceImage'),
            this.floofState.get('restImage')
        );
    }

    async getChatters() {
        let streamer = this.floofState.get('twitch');
        let url = `https://tmi.twitch.tv/group/user/${streamer}/chatters`;
        let canary = this.canary;
        let that = this;
        request.get(url).then(async function (e) {
            if (that.canary !== canary) {
                return; // Abort
            }
            let chatters = await FloofWorker.flatten(JSON.parse(e).chatters);
            await that.processActiveChatters(chatters);
            that.init = true;
            that.chatters = chatters;
        });
    }

    /**
     * @param {object} obj
     * @returns {Promise<Array>}
     */
    static async flatten(obj) {
        let flat = [];
        for (let k in obj) {
            if (obj.hasOwnProperty(k)) {
                for (let i = 0; i < obj[k].length; i++) {
                    flat.push(obj[k][i]);
                }
            }
        }
        return flat;
    }

    async processActiveChatters(current) {
        if (!this.init) {
            // First run doesn't need to queue animations
            return;
        }
        let diff = current.filter(x => !this.chatters.includes(x));
        let canary = this.canary;
        for (let i = 0; i < diff.length; i++) {
            this.greetQueue.push({"canary": canary, "chatter": diff[i]});
        }
    }

    /**
     * @param {module.FloofState} state
     * @return {module.FloofWorker}
     */
    setFloofState(state) {
        this.floofState = state;
        this.canary = FloofWorker.randomString(16);
        return this;
    }

    /**
     * Select the image for display on stream.
     *
     * @param {string} symlink
     * @param {string} activeImage
     */
    async selectImage(symlink, activeImage) {
        try {
            let bail = false;

            // If symlink is wrong, erase it.
            await fs.access(symlink, fsc.F_OK).then(async () => {
                let link = await fs.readlink(symlink);
                if (link === activeImage) {
                    bail = true;
                    return null;
                }
                return await fs.unlink(symlink);
            }).catch(()=>{});
            if (bail) {
                // Bail out. We're pointed at the right file.
                return null;
            }

            // If empty, bail out.
            if (activeImage === "") {
                return null;
            }

            // Now do the switch.
            if (process.platform === "win32") {
                /*
                 On Windows, if you don't have permission to create a symlink
                 (i.e. you're not running this as Administrator), we have to
                 delete and copy the file instead. This is much slower, but it
                 serves the same purpose.
                 */
                if (this.isWindowsAdmin) {
                    return await fs.symlink(activeImage, symlink, ()=>{
                        changeTime(activeImage);
                        changeTime(symlink);
                    });
                } else {
                    return await fs.copyFile(
                        activeImage,
                        symlink,
                        function () {
                            changeTime(activeImage);
                            changeTime(symlink);
                        }
                    );
                }
            } else {
                return await fs.symlink(activeImage, symlink, ()=>{
                    changeTime(activeImage);
                    changeTime(symlink);
                });
            }
        } catch (e) {
            myConsole.log(e.message);
        }
    }

    /**
     * Calculate a randomly-generated filename
     *
     * @param {number} len
     * @returns {string}
     */
    static randomString(len = 16) {
        let str = "";
        let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let charLen = 62;
        for (let i = 0; i < len; i++) {
            let r = randomInt(0, charLen - 1);
            str += chars.charAt(r);
        }
        return str;
    }

    async doSomeWork() {
        try {
            if (this.floofState.isValid()) {
                await this.getChatters();
                await this.kickoffAnimations();
            }
        } catch (e) {
            myConsole.log(this);
            myConsole.log(e.message);
        }
    }
};
