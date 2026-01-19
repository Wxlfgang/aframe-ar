AFRAME.registerComponent('ar-hit-test', {
  init() {
    this.reticle = this.el;
    this.sceneEl = this.el.sceneEl;
    this.viewerSpace = null;
    this.refSpace = null;
    this.hitTestSource = null;

    this.sceneEl.renderer.xr.addEventListener('sessionstart', async () => {
      const session = this.sceneEl.renderer.xr.getSession();
      this.viewerSpace = await session.requestReferenceSpace('viewer');
      this.refSpace = await session.requestReferenceSpace('local');

      this.hitTestSource = await session.requestHitTestSource({
        space: this.viewerSpace
      });

      session.addEventListener('select', () => {
        if (!this.reticle.visible) return;
        this.spawnObject();
      });
    });
  },

  tick() {
    const frame = this.sceneEl.frame;
    if (!frame || !this.hitTestSource) return;

    const hitTestResults = frame.getHitTestResults(this.hitTestSource);
    if (hitTestResults.length > 0) {
      const pose = hitTestResults[0].getPose(this.refSpace);
      this.reticle.object3D.position.copy(pose.transform.position);
      this.reticle.object3D.quaternion.copy(pose.transform.orientation);
      this.reticle.visible = true;
    } else {
      this.reticle.visible = false;
    }
  },

  spawnObject() {
    const isSnowman = Math.random() > 0.5;
    const entity = document.createElement('a-entity');

    entity.setAttribute(
      'position',
      this.reticle.object3D.position
    );

    if (isSnowman) {
      entity.innerHTML = `
        <a-sphere radius="0.15" position="0 0.15 0" color="#ffffff"></a-sphere>
        <a-sphere radius="0.11" position="0 0.38 0" color="#ffffff"></a-sphere>
        <a-sphere radius="0.07" position="0 0.55 0" color="#ffffff"></a-sphere>
      `;
    } else {
      entity.innerHTML = `
        <a-cylinder height="0.1" radius="0.04" color="#8b5a2b" position="0 0.05 0"></a-cylinder>
        <a-cone height="0.3" radius-bottom="0.2" color="#0b6623" position="0 0.25 0"></a-cone>
        <a-cone height="0.25" radius-bottom="0.16" color="#0e7a2a" position="0 0.45 0"></a-cone>
        <a-cone height="0.2" radius-bottom="0.12" color="#149c3f" position="0 0.62 0"></a-cone>
      `;
    }

    this.sceneEl.appendChild(entity);
  }
});
