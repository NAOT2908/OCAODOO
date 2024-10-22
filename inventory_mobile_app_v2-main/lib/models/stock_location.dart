class StockLocation {
  int? id;
  String? name;

  StockLocation({this.id, this.name});

  factory StockLocation.fromJson(Map<String, dynamic> data) {
    return StockLocation(
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