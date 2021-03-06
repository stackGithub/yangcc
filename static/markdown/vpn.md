1、 先看看你的主机是否支持pptp，返回结果为yes就表示通过。
```
modprobe ppp-compress-18 && echo yes
```

2、 是否开启了TUN，有的虚拟机主机需要开启，返回结果为cat: /dev/net/tun: File descriptor in bad state。就表示通过。
```
cat /dev/net/tun
```
3、 安装ppp , pptpd 和 iptables。
先更新一下再安装。
```
yum update
```
安装ppp和pptpd。
```
yum -y install ppp pptpd
```

安装iptables。这是自带的，如果没有的话就安装。
```
yum install iptables
```
4、 配置pptpd.conf。
```
vi /etc/pptpd.conf

#找到localip，去掉开始的那个#符号 
localip 192.168.0.1
remoteip 192.168.0.234-238,192.168.0.245
#这些是默认的，一般不需要去修改，分配给客户端的ip就是234到238之间，你也可以往大了写，看你的客户端有多少。
```

5、 配置options.pptpd。
```
vi /etc/ppp/options.pptpd     
#在末尾添加dns
ms-dns  8.8.8.8       #这是谷歌的，你也可以改成阿里巴巴的或者其它
ms-dns  8.8.4.4
```
6、 配置连接VPN客户端要用到的帐号密码。
```
vi /etc/ppp/chap-secrets    #格式很通俗易懂。

#   client为帐号，server是pptpd服务，secret是密码，*表示是分配任意的ip
# Secrets for authentication using CHAP
# client        server     secret                  IP addresses
  count         pptpd      771297972               *
```
7、 配置sysctl.conf
```
vi /etc/sysctl.conf

#添加一行    net.ipv4.ip_forward = 1    到末尾即可，然后保存
sysctl -p    #运行这个命令会输出上面添加的那一行信息，意思是使内核修改生效
```
8、 这个时候把iptables关闭的话是可以连接VPN了，之所以要把iptables关闭是因为没有开放VPN的端口，客户如果直接连接的话是不允许的。这里还需要设置iptables的转发规则，让你的客户端连接上之后能访问外网。
```
iptables -t nat -F
iptables -t nat -A POSTROUTING -s 192.168.0.234/24 -j SNAT --to 你的服务器的公网IP
#192.168.0.234/24是你分配给客户的ip，后面的那个是你的服务器的公网IP
```
9、 这个时候还是连接不上的，因为iptables把客户的VPN连接拦截了，不允许连接，所以得开放相应的端口。具体是哪个端口可以自己查下，我的是默认的，如果你没有更改过的话也会是默认的。
```
iptables -I INPUT -p tcp --dport 1723 -j ACCEPT
iptables -I INPUT -p tcp --dport 47 -j ACCEPT
iptables -I INPUT -p gre -j ACCEPT
```
10、 保险起见，到了这里应该重启一下pptpd服务和iptables服务生效。
```
systemctl restart iptables
systemctl restart pptpd
```
