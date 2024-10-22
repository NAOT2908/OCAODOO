import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:inven_barcode_app/bloc/company/company_event.dart';
import 'package:inven_barcode_app/bloc/company/company_state.dart';
import 'package:inven_barcode_app/repositories/company_repository.dart';

class CompanyBloc extends Bloc<CompanyEvent, CompanyState> {
  final CompanyRepository companyRepository;

  CompanyBloc({required this.companyRepository}) : super(const CompanyState()) {
    on<LoadUserCompaniesEvent>(_handleLoadUserCompaniesEvent);
    // on<LoadingUserCompaniesEvent>(_handleLoadingUserCompaniesEvent);
    // on<SelectedCompanyChangeEvent>(_handleSelectedCompanyChangeEvent);
  }

  // void _handleLoadingUserCompaniesEvent(
  //     LoadingUserCompaniesEvent event, Emitter<CompanyState> emit) async {
  // try {
  //   List<Company> companyList = await companyRepository.getUserCompanyList();

  //   emit(state.copyWith(
  //     userCompanies: companyList,
  //     selectCompanyId: companyList[0].id,
  //     loadedData: true,
  //   ));
  // } catch (e) {
  //   print("Error Loading Company List");
  // }
  // }

  // void _handleSelectedCompanyChangeEvent(
  //     SelectedCompanyChangeEvent event, Emitter<CompanyState> emit) {
  //   emit(state.copyWith(selectCompanyId: event.value));
  // }

  Future<void> _handleLoadUserCompaniesEvent(
      LoadUserCompaniesEvent event, Emitter<CompanyState> emit) async {
    emit(state.copyWith(
      loadingList: true,
      myCompanies: [],
    ));

    final result = await companyRepository.getUserCompanyList();

    emit(state.copyWith(
      loadingList: false,
      myCompanies: result,
    ));
  }
}
