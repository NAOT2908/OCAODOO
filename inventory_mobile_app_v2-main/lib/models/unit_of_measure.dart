class UnitOfMeasure {
  int? id;
  String? name;

  UnitOfMeasure({
    this.id,
    this.name,
  });

  factory UnitOfMeasure.fromJson(Map<String, dynamic> data) {
    return UnitOfMeasure(
      id: data['id'] != null ? data['id'] as int : null,
      name: data['name'] != null ? data['name'] as String : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
    };
  }
}
