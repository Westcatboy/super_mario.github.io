class EntityCollider {
    constructor(entities) {
        this.entites = entities;
    }

    check(subject) {
        this.entites.forEach(candidate => {
            if (subject === candidate) {
                return;
            }
            if (subject.bounds.overlaps(candidate.bounds)){
                subject.collides(candidate);
            }
        })
    }
}
