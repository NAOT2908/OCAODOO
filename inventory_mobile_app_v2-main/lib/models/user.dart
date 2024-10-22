class User {
  int id;
  String name;
  String? avatar;

  User({
    required this.id,
    required this.name,
    this.avatar,
  });

  factory User.fromJson(Map<String, dynamic> data) {
    return User(
      id: data['id'],
      name: data['name'],
      avatar: data['image_1024'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'image_1024': avatar,
    };
  }
}
