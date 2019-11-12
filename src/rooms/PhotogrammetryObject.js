import * as THREE from 'three';
var scene, doorMaterial, door;

function createDoorMaterial(ctx) {
  ctx.assets['doorfx_tex'].wrapT = THREE.RepeatWrapping;
  ctx.assets['doorfx_tex'].wrapS = THREE.RepeatWrapping;
  return new THREE.ShaderMaterial({
    uniforms: {
      time: {value: 0},
      selected: {value: 0},
      tex: {value: ctx.assets['doorfx_tex']}
    },
    vertexShader: ctx.shaders.basic_vert,
    fragmentShader: ctx.shaders.door_frag
  });
}

export function setup(ctx) {
  const assets = ctx.assets;
  scene = assets['pg_object_model'].scene;
  assets['pg_object_tex'].encoding = THREE.sRGBEncoding;
  assets['pg_object_tex'].flipY = false;
  assets['pg_floor_tex'].encoding = THREE.sRGBEncoding;
  assets['pg_floor_tex'].flipY = false;
  assets['pg_floor_lm_tex'].encoding = THREE.sRGBEncoding;
  assets['pg_floor_lm_tex'].flipY = false;

  assets['pg_floor_tex'].wrapS = THREE.RepeatWrapping;
  assets['pg_floor_tex'].wrapT = THREE.RepeatWrapping;

  assets['pg_bg_tex'].encoding = THREE.sRGBEncoding;
  assets['pg_bg_tex'].flipY = false;

  assets['pg_flare_tex'].encoding = THREE.sRGBEncoding;
  assets['pg_flare_tex'].flipY = false;

  assets['pg_panel_tex'].encoding = THREE.sRGBEncoding;
  assets['pg_panel_tex'].flipY = false;

  assets['pg_door_lm_tex'].encoding = THREE.sRGBEncoding;
  assets['pg_door_lm_tex'].flipY = false;

  scene.getObjectByName('object').material =
    new THREE.MeshBasicMaterial({map: assets['pg_object_tex']});
  scene.getObjectByName('floor').material =
    new THREE.MeshBasicMaterial({map: assets['pg_floor_tex'], lightMap: assets['pg_floor_lm_tex']});
  scene.getObjectByName('bg').material =
    new THREE.MeshBasicMaterial({map: assets['pg_bg_tex']});
  scene.getObjectByName('flare').material =
    new THREE.MeshBasicMaterial({map: assets['pg_flare_tex'], blending: THREE.AdditiveBlending});
  scene.getObjectByName('panel').material =
    new THREE.MeshBasicMaterial({map: assets['pg_panel_tex']});
  scene.getObjectByName('door_frame').material =
    new THREE.MeshBasicMaterial({map: assets['pg_door_lm_tex']});

  doorMaterial = createDoorMaterial(ctx);
  door = scene.getObjectByName('door');
  door.material = doorMaterial;

  scene.getObjectByName('teleport').visible = false;

  ctx.raycontrol.addState('doorPhotogrammetry', {
    colliderMesh: scene.getObjectByName('door'),
    onHover: (intersection, active) => {
      //teleport.onHover(intersection.point, active);
      const scale = intersection.object.scale;
      scale.z = Math.min(scale.z + 0.05 * (2 - door.scale.z), 1.5);
    },
    onHoverLeave: () => {
      //teleport.onHoverLeave();
    },
    onSelectStart: (intersection, e) => {
      ctx.goto = 0;
      //teleport.onSelectStart(e);
    },
    onSelectEnd: (intersection) => {
      //teleport.onSelectEnd(intersection.point);
    }
  });

  let teleport = scene.getObjectByName('teleport');
  teleport.visible = true;
  teleport.material.visible = false;
  ctx.raycontrol.addState('teleportPhotogrammetry', {
    colliderMesh: teleport,
    onHover: (intersection, active) => {
      ctx.teleport.onHover(intersection.point, active);
    },
    onHoverLeave: () => {
      ctx.teleport.onHoverLeave();
    },
    onSelectStart: (intersection, e) => {
      ctx.teleport.onSelectStart(e);
    },
    onSelectEnd: (intersection) => {
      ctx.teleport.onSelectEnd(intersection.point);
    }
  });
}

export function enter(ctx) {
  ctx.renderer.setClearColor(0x000000);
  ctx.scene.add(scene);
  ctx.cameraRig.position.set(0, 0, 2);
  ctx.raycontrol.activateState('doorPhotogrammetry');
  ctx.raycontrol.activateState('teleportPhotogrammetry');
}

export function exit(ctx) {
  ctx.raycontrol.deactivateState('doorPhotogrammetry');
  ctx.raycontrol.deactivateState('teleportPhotogrammetry');

  ctx.scene.remove(scene);
}

export function execute(ctx, delta, time) {
  doorMaterial.uniforms.time.value = time;

  if (door.scale.z > 0.5) {
    door.scale.z = Math.max(door.scale.z - delta * door.scale.z, 0.5);
  }
}