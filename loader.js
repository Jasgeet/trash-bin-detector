const w = window.innerWidth,
    h = window.innerHeight
const amount = 37

function setup() {
    v = min(w, h)
    createCanvas(w, h)
    // No need of specifying background color here
    // as it's already there in draw()
}

function draw() {
    // 1st blue background should appear for 0.5 sec then
    // loader should load till it completes 1 cycle of loading
    // approx takes 6 secs = 360 frames
    // so start loading after 0.5 sec = 30 frames till 6 secs
    
    if(frameCount > 30 && frameCount < 390) {
        colorMode(RGB)
        background(0, 0, 0, 10)

        // since delayed loading by 30 frames, need to subtract
        // 30 frames for loader to load from beginning, otherwise
        // it'll skip the first 30 frames and display incomplete loader 
        
        var t = ((frameCount - 30) / 60) + ((3 / 2) * PI)
        t += sin(frameCount / 60) / (3 * 2)
        const R = v / 3

        for (let i = 0; i < amount; i++) {
            const a = i / amount * PI * (sin(t) + 1) + t
            const r = v / 20 * sin(i / amount * 10 * PI) * (sin(t) + 1) / 2
            const x = w / 2 + (R + r) * cos(a)
            const y = h / 2 - (R + r) * sin(a)

            colorMode(HSB, 2 * PI, 100, 100)
            stroke(a - t, 50, 100)
            fill(a - t, 50, 100)
            ellipse(x, y, v / 50, v / 50)
        }
    }
}
