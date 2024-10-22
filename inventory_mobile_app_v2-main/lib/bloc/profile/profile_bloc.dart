import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:inven_barcode_app/bloc/profile/profile_event.dart';
import 'package:inven_barcode_app/bloc/profile/profile_state.dart';
import 'package:inven_barcode_app/repositories/user_repository.dart';

class ProfileBloc extends Bloc<ProfileEvent, ProfileState> {
  final UserRepository userRepository;

  ProfileBloc({ required this.userRepository }): super(const ProfileState()) {
    on<FetchProfileEvent>(_handleFetchProfileEvent);
  }

  Future<void> _handleFetchProfileEvent(FetchProfileEvent event, Emitter<ProfileState> emit) async {
    if (event.userId == null) {
      return;
    }

    final user = await userRepository.fetchUser(userId: event.userId!);

    emit(state.copyWith(user: user));
  }
}