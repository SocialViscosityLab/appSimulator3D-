/**
 * @param {Marker} _marker An instance of Marker
 */
class ArrowheadField {
    constructor(_cyclist, _rings, _radius) {
        this.cyclist = _cyclist;
        this.arrows = [];
        this.initializeConcentric(_rings, _radius);
        this.target;

    }

    initializeConcentric(rings, radius) {
        let parts = 6
        for (let i = 1; i <= rings; i++) {
            let angle = (Math.PI * 2) / (i * parts)
            for (let j = 0; j < i * parts; j++) {
                let pos = Utils.polarToCartesian(angle * j, radius * i);
                // create arrow at 0,0,0
                let arrw = new Arrowhead();
                // assign position in the field
                arrw.setPosition(pos.x, pos.y, pos.z);
                // Store arrows locally
                this.arrows.push(arrw);
                // add to parent mesh
                this.cyclist.mesh.add(arrw.mesh);
            }
        }
    }


    scale(val) {
        this.arrows.forEach(element => {
            element.scale(val)
        });
    }


    /**
     * Set target to look at 
     * @param {Marker} _target 
     */
    setTarget(_target) {
        this.arrows.forEach(element => {
            element.lookAt(_target);
        });
    }
}