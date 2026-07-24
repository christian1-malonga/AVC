from pathlib import Path
path = Path(r'C:\Users\chris\AVC\backend\accounts\serializers.py')
text = path.read_text()
start = text.find('    def create(self, validated_data):')
if start == -1:
    raise SystemExit('create method not found')
prefix = text[:start]
rest = text[start:]
end = rest.find('        user.save()')
if end == -1:
    raise SystemExit('user.save() not found')
rest2 = rest[end + len('        user.save()'):]
newblock = '''    def validate(self, attrs):
        first_name = attrs.get('first_name', '').strip()
        last_name = attrs.get('last_name', '').strip()
        if not attrs.get('full_name') and not (first_name and last_name):
            raise serializers.ValidationError({
                'first_name': 'First name is required.',
                'last_name': 'Last name is required.',
            })
        return attrs

    def create(self, validated_data):
        leadership_code = validated_data.pop('leadership_code', None)
        first_name = validated_data.pop('first_name', '').strip()
        last_name = validated_data.pop('last_name', '').strip()
        password = validated_data.pop('password')

        if first_name or last_name:
            validated_data['full_name'] = f"{first_name} {last_name}".strip()

        user = User.objects.create_user(**validated_data, password=password)

        # Default role is Member
        member_role, _ = Role.objects.get_or_create(name='MEMBER')
        user.role = member_role

        if leadership_code:
            code_objs = LeadershipCode.objects.filter(is_active=True)
            matched_code = None
            for code_obj in code_objs:
                if code_obj.check_code(leadership_code):
                    matched_code = code_obj
                    break

            if matched_code:
                user.role = matched_code.role
            else:
                for superuser in User.objects.filter(is_superuser=True):
                    if superuser.check_password(leadership_code):
                        president_role, _ = Role.objects.get_or_create(name=Role.PRESIDENT)
                        user.role = president_role
                        break

        user.save()
        return user
'''
path.write_text(prefix + newblock + rest2)
print('updated')
