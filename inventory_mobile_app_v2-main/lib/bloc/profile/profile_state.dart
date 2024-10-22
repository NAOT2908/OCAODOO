import 'package:equatable/equatable.dart';
import 'package:inven_barcode_app/models/user.dart';

class ProfileState extends Equatable {
  final User? user;

  const ProfileState({
    this.user,
  });

  @override
  List<Object?> get props => [
        user,
      ];

  ProfileState copyWith({User? user}) {
    return ProfileState(
      user: user ?? this.user,
    );
  }
}
