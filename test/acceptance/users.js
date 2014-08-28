/* global describe, before, beforeEach, it */

'use strict';

process.env.DB   = 'template-test';

var expect  = require('chai').expect,
    cp      = require('child_process'),
    app     = require('../../app/index'),
    cookie  = null,
    request = require('supertest');

describe('users', function(){
  before(function(done){
    request(app).get('/').end(done);
  });

  beforeEach(function(done){
    cp.execFile(__dirname + '/../scripts/clean-db.sh', [process.env.DB], {cwd:__dirname + '/../scripts'}, function(err, stdout, stderr){
      request(app)
      .post('/login')
      .send('email=bob@aol.com')
      .send('password=1234')
      .end(function(err, res){
        cookie = res.headers['set-cookie'][0];
        done();
      });
    });
  });

  describe('get /profile/edit', function(){
    it('should show the profile/edit page', function(done){
      request(app)
      .get('/profile/edit')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('bob@aol.com');
        expect(res.text).to.include('Email');
        expect(res.text).to.include('Phone');
        expect(res.text).to.include('Public');
        done();
      });
    });
  });

  describe('put /profile', function(){
    it('should edit the profile/edit page', function(done){
      request(app)
      .post('/profile')
      .send('_method=put&visible=public&email=bob%40aol.com&phone=333-222-4444&photo=http%3A%2F%2Fphoto.com&tagline=good+ole+bob&facebook=http%3A%2F%2Ffacebook.com&twitter=http%3A%2F%2Ftwitter.com')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/profile');
        done();
      });
    });
  });

  describe('get /users', function(){
    it('should get the users index page', function(done){
      request(app)
      .get('/users')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        // expect(res.headers.location).to.equal('/users');
        done();
      });
    });
  });

  describe('post /message/3', function(){
    it('should post a message to a specific user', function(done){
      request(app)
      .post('/message/000000000000000000000002')
      .set('cookie', cookie)
      .send('mtype=text&message=text-hey')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/users/sam@aol.com');

        done();
      });
    });
  });

});

