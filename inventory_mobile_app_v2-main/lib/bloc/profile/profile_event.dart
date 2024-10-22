class ProfileEvent {}

class FetchProfileEvent extends ProfileEvent {
  final int? userId;

  FetchProfileEvent({this.userId});
}