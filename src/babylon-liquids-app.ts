import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, FreeCamera, Vector3, Color3, HemisphericLight, Mesh, MeshBuilder, SphereDirectedParticleEmitter, ShaderMaterial, StandardMaterial } from "@babylonjs/core";

class App {
    // HTML elements
    canvas: HTMLCanvasElement;

    // Babylon elements
    engine: Engine;
    scene: Scene;

    // Shaders
    shaderMaterial: ShaderMaterial;
    shaderMaterial2: ShaderMaterial;

    // Objects
    sphere: Mesh;
    sphere2: Mesh;
    angle: number;
    
    constructor() {
        this.angle = 0;
        this.setupCanvas("babylonLiquids");
        document.body.style.margin = "0";
        document.body.style.padding = "0";
        document.body.style.overflow = "hidden";

        // initialize babylon scene and engine
        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);
        
        // create scene
        this.createScene(this.scene, this.canvas);

        // add event listeners
        this.addListeners();
    }

    public async createScene(scene: Scene, canvas: HTMLCanvasElement) {
        // camera
        var camera = new FreeCamera("camera", new Vector3(0, 5, 10), scene);
        camera.setTarget(Vector3.Zero());
        camera.attachControl(canvas, true);
        
        // shaders
        this.shaderMaterial = new ShaderMaterial("shader", scene, "./liquids", {
            attributes: ["position", "normal", "uv"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "lightPos"],
        });
        this.shaderMaterial2 = new ShaderMaterial("shader", scene, "./white", {
            attributes: ["position", "normal", "uv"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "lightPos"],
        });

        // objects
        this.sphere = MeshBuilder.CreateTorusKnot("torusKnot", { radialSegments: 64, tubularSegments: 5, p: 2 }, scene);//MeshBuilder.CreateSphere("sphere1", { diameter: 1 }, scene);
        this.sphere.position.y = 1;
        this.sphere.material = this.shaderMaterial;

        this.sphere2 = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);
        this.sphere2.material = this.shaderMaterial2;
        
        // setup environment
        const env = scene.createDefaultEnvironment();
      
        // here we add XR support
        const xr = await scene.createDefaultXRExperienceAsync({
          floorMeshes: [env.ground],
        });
    }

    /**
     * Update step. Runs each render loop before rendering. Updates objects in scene and shader uniforms
     */
    update() {
        this.angle += this.engine.getDeltaTime()/5000;
        this.shaderMaterial.setVector3("lightPos", new Vector3(5*Math.sin(this.angle), 1, 5*Math.cos(this.angle)));
        this.sphere2.position = new Vector3(5*Math.sin(this.angle), 1, 5*Math.cos(this.angle));
        //this.sphere.rotate(new Vector3(0, 1, 0), -this.engine.getDeltaTime()/5000);
    }

    /**
     * Render step. Runs each render loop after updating objects. Renders objects to canvas, and performs relevant processing operations
     */
    render() {
        this.scene.render();
    }

    run() {
        // run the main render loop
        this.engine.runRenderLoop(() => {
            this.update();
            this.render();
        });
    }

    onResize() {
        this.engine.setSize(window.innerWidth, window.innerHeight);
    }

    setupCanvas(id: string) {
        // create the canvas html element and attach it to the webpage
        this.canvas = document.createElement("canvas");
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.id = id;
        document.body.appendChild(this.canvas);
    }

    setupHemisphericLight(light: HemisphericLight, name: string) {
        light = new HemisphericLight(name, new Vector3(1, 1, 0), this.scene);
    }

    setupSphere(sphere: Mesh, name: string, diameter: GLfloat) {
        sphere = MeshBuilder.CreateSphere(name, { diameter: diameter }, this.scene);
    }

    addListeners() {
        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
                if (this.scene.debugLayer.isVisible()) {
                    this.scene.debugLayer.hide();
                } else {
                    this.scene.debugLayer.show();
                }
            }
        });

        window.addEventListener("resize", (ev) => {
            this.onResize();
        })
    }
}

var app: App = new App();
app.run();
