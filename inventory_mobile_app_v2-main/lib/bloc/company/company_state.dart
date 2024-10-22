import 'package:equatable/equatable.dart';
import 'package:inven_barcode_app/models/company.dart';

class CompanyState extends Equatable {
  final bool loadingList;
  final List<Company>? myCompanies;

  const CompanyState({
    this.myCompanies,
    this.loadingList = false,
  });

  @override
  List<Object?> get props => [
        myCompanies,
        loadingList,
      ];

  CompanyState copyWith({
    List<Company>? myCompanies,
    bool? loadingList,
  }) {
    return CompanyState(
      myCompanies: myCompanies ?? this.myCompanies,
      loadingList: loadingList ?? this.loadingList,
    );
  }
}
