class Company {
  final int? id;
  final String? name;

  Company({this.id, this.name});

  factory Company.fromJson(Map<String, dynamic> data) {
    return Company(
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
