/**
 * The Fantasma class has visual purpose only. It represents a ghost in the app, usually as a position on a map. 
 * 
 * If you want to access the position of a ghost it us usually better to get it from the database (see communication.js). 
 * 
 * If you need to get the ghost's position on the map you need to use getPositionOnMap() of the Marker superclass.
 * 
 */

class Fantasma extends Marker {
    constructor(_scene, _geometry, _material) {
        super(_scene);
        if (_geometry) {
            this.geometry = _geometry;
        } else {
            this.geometry = new THREE.CylinderGeometry(10, 3, 10, 32);
        }

        if (_material) {
            this.material = _material;
        } else {
            this.material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        }
        this.route = [];
    }

    AddRoute(route) {
        this.route = route;
    }

    /**
     * This is an attempt to load objects into the map. June 2023. It is not working yet
     */
    static loadModel() {

        import ("../libs/vendor/jsm/loaders/GLTFLoader.js").then((mod) => {
            let loader = new mod.GLTFLoader();
            loader.load(
                // resource URL
                './obj/Ghost3D/ghost3DModel.glb',

                // called when the resource is loaded
                function(gltf) {
                    let model = gltf.scene;
                    model.traverse((o) => {
                        if (o.isMesh) {
                            o.material = new THREE.MeshPhongMaterial({ color: 0x552811 });
                            o.castShadow = true;
                            o.receiveShadow = true;
                        }
                    });

                    console.log(model.isObject3D);
                    // console.log(world._engine._scene.children[3]);
                    // world._engine._scene.children[3].children[0] = model.children[0];
                    // ghost.mesh = model.children[0];
                    // console.log(world._engine._scene.children[3]);

                    //      world._engine._scene.add(model);
                },
                // called while loading is progressing
                function(xhr) {
                    console.log((xhr.loaded / xhr.total * 100) + '% loaded');

                },
                // called when loading has errors
                function(error) {
                    console.log('An error happened');
                }
            );

        });

        //  console.log(model)

    }
}