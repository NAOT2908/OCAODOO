import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:inven_barcode_app/bloc/auth/auth_bloc.dart';
import 'package:inven_barcode_app/bloc/auth/auth_event.dart';
import 'package:inven_barcode_app/bloc/auth/auth_state.dart';
import 'package:inven_barcode_app/commons/validation.dart';
import 'package:inven_barcode_app/widets/form/form_label.dart';
import 'package:inven_barcode_app/widets/form/form_select.dart';
import 'package:inven_barcode_app/widets/form/text_input.dart';
import 'package:inven_barcode_app/widets/primary_button.dart';

class StarterPage extends StatefulWidget {
  const StarterPage({super.key});

  @override
  State<StarterPage> createState() => _StarterPageState();
}

class _StarterPageState extends State<StarterPage> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: 12.0,
        ),
        color: Colors.white,
        child: SafeArea(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              SizedBox(
                height: 90,
                child: SvgPicture.asset(
                  'assets/images/logo.svg',
                  colorFilter: ColorFilter.mode(
                    Theme.of(context).colorScheme.primary,
                    BlendMode.srcIn,
                  ),
                ),
              ),
              const SizedBox(
                height: 5,
              ),
              const LoginForm()
            ],
          ),
        ),
      ),
    );
  }
}

class LoginForm extends StatefulWidget {
  const LoginForm({super.key});

  @override
  State<LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends State<LoginForm> {
  final _formGlobalKey = GlobalKey<FormState>();
  final TextEditingController _websiteController = TextEditingController();

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AuthBloc, AuthState>(
      builder: (BuildContext context, AuthState state) {
        _websiteController.text = _websiteController.text.isNotEmpty
            ? _websiteController.text
            : (state.website ?? '');

        return Form(
          key: _formGlobalKey,
          child: Column(
            children: [
              state.starterStep == 1
                  ? Column(
                      children: [
                        const FormLabel(labelText: 'Website'),
                        const SizedBox(
                          height: 5,
                        ),
                        TextInput(
                          controller: _websiteController,
                          hintText: 'Website của bạn',
                          validator: (String? v) {
                            if (v == null || v == '') {
                              return 'Vui lòng nhập website của bạn';
                            }

                            if (!isUrlString(v)) {
                              return 'Giá trị phải là url';
                            }

                            return null;
                          },
                        ),
                      ],
                    )
                  : Container(),
              state.starterStep == 2 && state.dbList != null
                  ? Column(
                      children: [
                        const FormLabel(labelText: 'Danh sách dữ liệu'),
                        const SizedBox(
                          height: 5,
                        ),
                        FormSelect<String>(
                          items: state.dbList!
                              .map((item) => DropdownMenuItem(
                                    value: item,
                                    child: Text(item),
                                  ))
                              .toList(),
                          selectedValue:
                              state.selectedDb ?? state.dbList?.first,
                          onChanged: (String? value) {
                            context.read<AuthBloc>().add(
                                  SaveDBEvent(db: value ?? ''),
                                );
                          },
                        ),
                      ],
                    )
                  : Container(),
              const SizedBox(
                height: 20,
              ),
              state.starterError != null && state.starterError!.isNotEmpty
                  ? Column(
                      children: [
                        Text(
                          state.starterError!,
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.error,
                            fontSize: 14.0,
                          ),
                        )
                      ],
                    )
                  : Container(),
              PrimaryButton(
                onPressed: state.starterLoading
                    ? null
                    : () {
                        if (state.starterStep == 1) {
                          if (_formGlobalKey.currentState!.validate()) {
                            _formGlobalKey.currentState?.save();

                            context.read<AuthBloc>().add(
                                  SaveWebsiteEvent(
                                    website: _websiteController.text,
                                  ),
                                );
                          }
                        } else {
                          context.read<AuthBloc>().add(
                                SaveDBEvent(
                                  db: state.selectedDb!,
                                  nextStep: true,
                                ),
                              );
                        }
                      },
                labelText: "Lưu",
              ),
              state.starterStep == 2
                  ? Column(
                      children: [
                        const SizedBox(
                          height: 4,
                        ),
                        GestureDetector(
                          onTap: () {
                            context
                                .read<AuthBloc>()
                                .add(ResetWebsiteOrDbEvent(onlyDb: false));
                          },
                          child: Text(
                            'Thay đổi thông tin website',
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.primary,
                            ),
                          ),
                        ),
                      ],
                    )
                  : Container(),
            ],
          ),
        );
      },
      listener: (BuildContext context, AuthState state) {
        if (state.starterStep == 3) {
          context.goNamed('login');
        }
      },
    );
  }

  @override
  void dispose() {
    super.dispose();

    _websiteController.dispose();
  }
}
