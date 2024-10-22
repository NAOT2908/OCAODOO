import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:inven_barcode_app/bloc/auth/auth_bloc.dart';
import 'package:inven_barcode_app/bloc/auth/auth_event.dart';
import 'package:inven_barcode_app/bloc/auth/auth_state.dart';
import 'package:inven_barcode_app/commons/validation.dart';
import 'package:inven_barcode_app/widets/form/form_label.dart';
import 'package:inven_barcode_app/widets/form/password_input.dart';
import 'package:inven_barcode_app/widets/form/text_input.dart';
import 'package:inven_barcode_app/widets/primary_button.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
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
  bool _isSubmitting = false;

  final _formGlobalKey = GlobalKey<FormState>();
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AuthBloc, AuthState>(
        builder: (BuildContext context, AuthState state) {
      return Form(
        key: _formGlobalKey,
        child: Column(
          children: [
            const FormLabel(labelText: 'Email / Tài khoản'),
            const SizedBox(
              height: 5,
            ),
            TextInput(
              controller: _usernameController,
              hintText: 'Enter your username',
              validator: (String? v) {
                if (v == null || v == '') {
                  return 'Vui lòng nhập usename';
                }

                if (!isEmailString(v)) {
                  return 'Tài khoản phải là email.';
                }

                return null;
              },
            ),
            const SizedBox(
              height: 20,
            ),
            const FormLabel(labelText: 'Mật khẩu'),
            const SizedBox(
              height: 5,
            ),
            PasswordInput(
              controller: _passwordController,
              validator: (String? v) {
                if (v == null || v == '') {
                  return 'Vui lòng nhập password';
                }

                return null;
              },
            ),
            const SizedBox(
              height: 20,
            ),
            state.loginError
                ? Column(
                    children: [
                      Text(
                        'Đăng nhập thất bại!',
                        style: TextStyle(
                          color: Theme.of(context).colorScheme.error,
                          fontSize: 20.0,
                        ),
                      )
                    ],
                  )
                : Container(),
            PrimaryButton(
                onPressed: _isSubmitting
                    ? null
                    : () {
                        if (_formGlobalKey.currentState!.validate()) {
                          setState(() {
                            _isSubmitting = true;
                          });
                          _formGlobalKey.currentState?.save();

                          context.read<AuthBloc>().add(
                                StartLoginEvent(
                                  username: _usernameController.text,
                                  password: _passwordController.text,
                                ),
                              );
                        }
                      },
              labelText: "Đăng Nhập",
            ),
            const SizedBox(
              height: 4,
            ),
            GestureDetector(
              onTap: () {
                context
                    .read<AuthBloc>()
                    .add(ResetWebsiteOrDbEvent(onlyDb: true));
              },
              child: Text(
                'Thay đổi thông tin dữ liệu',
                style: TextStyle(
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
            ),
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
        ),
      );
    }, listener: (BuildContext context, AuthState state) {
      if (state.loginError) {
        setState(() {
          _isSubmitting = false;
        });
      }

      if (state.loginSuccess) {
        if (state.checkModule) {
          context.goNamed('index');
        } else {
          context.goNamed('modules');
        }
      }

      if (state.starterStep != 3) {
        context.replaceNamed('starter');
      }
    });
  }

  @override
  void dispose() {
    super.dispose();

    _usernameController.dispose();
    _passwordController.dispose();
  }
}
