#!"C:\xampp\perl\bin\perl.exe"
use strict;
use warnings;

use DBI;
use CGI;
use JSON;

my $cgiVar = CGI->new;


my $dbFileName = 'appointments.sq3';
my $dsn = "dbi:SQLite:$dbFileName";
my $user = "";
my $pass = "";

my $dbh = DBI->connect($dsn, $user, $pass, {
                      PrintError => 0,
                      RaiseError => 1,
                      AutoCommit => 1,
                      FetchHashKeyName => 'NAME_lc'
                    });





my $apptdate = $cgiVar->param("date_time");
my $apptdesc = $cgiVar->param("desc");

#if data post then need to insert it 

if(length($apptdate) && length($apptdesc)) {

  my $sth = $dbh->prepare("INSERT INTO appointments (date_time, description) VALUES (?,?)");
  $sth->execute($apptdate, $apptdesc);

} 

# get the appointments from DB 
sub getAppointments {
  my $query = lc(shift);
  my @result = ();

  my $sth = $dbh->prepare("SELECT date_time, description FROM appointments");
  $sth->execute();

  while(my $row = $sth->fetchrow_hashref) {
    # If a search query is included, push to result array if it matches any of the description texts
    if(length($query) > 0) {
      next if lc($row->{'description'}) !~ /$query/;
    }

    push(@result, $row);
  }

  return @result;
}

# get the paramter from the post request if any  if any to be used in filtering query 
my @appts = getAppointments($cgiVar->param("q")); 
my %resp_body = (
  "data" => \@appts,
  "errors" => ()
);



$dbh->disconnect();

# return Json response to be viewed to user 
print "Content-Type: application/json\n\n";
print encode_json \%resp_body;