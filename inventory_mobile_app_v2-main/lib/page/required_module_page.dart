import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:inven_barcode_app/bloc/auth/auth_bloc.dart';
import 'package:inven_barcode_app/bloc/auth/auth_event.dart';
import 'package:inven_barcode_app/bloc/auth/auth_state.dart';
import 'package:inven_barcode_app/widets/primary_button.dart';

class RequiredModulePage extends StatelessWidget {
  const RequiredModulePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocConsumer<AuthBloc, AuthState>(
          builder: (BuildContext context, AuthState state) {
        return Container(
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
                const Text('Hệ thống của bạn chưa cài đặt module cần thiết!.'),
                const Text(' Vui lòng cài đặt và bấm thử lại.'),
                const SizedBox(
                  height: 5,
                ),
                PrimaryButton(
                  onPressed: state.checkModuleLoading
                      ? null
                      : () {
                          context.read<AuthBloc>().add(
                                CheckRequiredModuleEvent(),
                              );
                        },
                  labelText: 'Thử Lại',
                ),
              ],
            ),
          ),
        );
      }, listener: (BuildContext context, AuthState state) {
        if (state.checkModule) {
          context.goNamed('index');
        }
      }),
    );
  }
}
